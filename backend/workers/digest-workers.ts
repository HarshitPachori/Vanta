import { eq, and, inArray } from 'drizzle-orm';
import { digests, digestSenders, senders, users } from '@backend/db/schema';
import { getDb } from '@backend/lib/db';
import { logAudit } from '@backend/lib/audit';
import { now } from '@backend/lib/id';
import { getValidAccessToken, listMessageIds, batchGetMessagesForDigest, parseFrom } from '@backend/lib/gmail';
import { buildDigestEmail } from '@backend/lib/digest-email';
import { sendEmail } from '@backend/lib/resend';

export type DigestMessage = { type: 'digest'; digestId: string };

const getEmailUrl = (messageId: string) => `https://mail.google.com/mail/u/0/#inbox/${messageId}`;

type RawItem = { from: string; subject: string; date: string; url: string; body: string };

const summarizeItems = async (ai: Ai, items: RawItem[]): Promise<(string | undefined)[]> => {
	if (items.length === 0) return [];

	const prompt = items.map((item, i) => `${i + 1}. From: ${item.from}\nSubject: ${item.subject}\nBody: ${item.body}`).join('\n\n');

	try {
		const result = await ai.run('@cf/meta/llama-3.1-8b-instruct-fp8', {
			messages: [
				{
					role: 'system',
					content:
						'You are a helpful assistant that summarizes emails. For each numbered email below, write a single concise summary sentence (max 20 words). Return exactly one line per email, numbered to match. No extra text.',
				},
				{ role: 'user', content: prompt },
			],
		});

		const text = (result as { response?: string }).response ?? '';
		const lines = text
			.split('\n')
			.map((l) => l.trim())
			.filter((l) => /^\d+\./.test(l))
			.map((l) => l.replace(/^\d+\.\s*/, '').trim());

		// align by index — if AI returns fewer lines, remaining items get no summary
		return items.map((_, i) => lines[i] ?? undefined);
	} catch {
		return items.map(() => undefined);
	}
};

export const digestQueue = async (msg: DigestMessage, env: CloudflareEnv): Promise<void> => {
	const { digestId } = msg;
	const db = getDb(env.DB);

	const digest = await db
		.select()
		.from(digests)
		.where(and(eq(digests.id, digestId), eq(digests.status, 'active')))
		.get();

	if (!digest) return;

	const user = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			gmailAccessToken: users.gmailAccessToken,
			gmailRefreshToken: users.gmailRefreshToken,
			gmailTokenExpiry: users.gmailTokenExpiry,
		})
		.from(users)
		.where(eq(users.id, digest.userId))
		.get();

	if (!user) return;

	const accessToken = await getValidAccessToken(db, user.id, env);
	if (!accessToken) {
		await db.update(users).set({ scanStatus: 'token_expired', updatedAt: now() }).where(eq(users.id, user.id));
		return;
	}

	// get digest sender emails
	const ds = await db.select({ senderId: digestSenders.senderId }).from(digestSenders).where(eq(digestSenders.digestId, digestId)).all();

	if (ds.length === 0) return;

	const senderIds = ds.map((d) => d.senderId);
	const senderRows = await db
		.select({ email: senders.email, displayName: senders.displayName })
		.from(senders)
		.where(inArray(senders.id, senderIds))
		.all();

	if (senderRows.length === 0) return;

	// build Gmail query — emails from digest senders since last sent (min 7-day window for first run)
	const sinceTs = digest.lastSentAt ? digest.lastSentAt : Math.floor(Date.now() / 1000) - 7 * 86400;

	const fromQuery = senderRows.map((s) => `from:${s.email}`).join(' OR ');
	const query = `(${fromQuery}) after:${sinceTs}`;

	const messageIds = await listMessageIds(accessToken, query, 20);
	if (messageIds.length === 0) return;

	const details = await batchGetMessagesForDigest(accessToken, messageIds);

	// build raw items — full body text for AI summarization
	const rawItems: RawItem[] = details
		.filter((d) => !!d.from)
		.map((d) => {
			const { displayName } = parseFrom(d.from);
			const date = d.date ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
			return {
				from: displayName,
				subject: d.subject,
				date,
				url: getEmailUrl(d.id),
				body: d.body,
			};
		});

	if (rawItems.length === 0) return;

	// summarize with Cloudflare Workers AI — snippets processed in-memory, never stored
	const summaries = await summarizeItems(env.AI, rawItems);

	const items = rawItems.map((item, i) => ({
		from: item.from,
		subject: item.subject,
		date: item.date,
		url: item.url,
		summary: summaries[i],
	}));

	// build + send email
	const deliveryDate = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	});

	const { html, text } = buildDigestEmail({
		userName: user.name,
		digestName: digest.name,
		items,
		deliveryDate,
		clientBaseUrl: env.CLIENT_BASE_URI,
	});

	const sent = await sendEmail(
		{
			to: user.email,
			from: env.RESEND_FROM_EMAIL,
			subject: `${digest.name} — ${deliveryDate}`,
			html,
			text,
		},
		env.RESEND_API_KEY,
	);

	if (!sent) throw new Error('Failed to send digest email');

	await db.update(digests).set({ lastSentAt: now(), updatedAt: now() }).where(eq(digests.id, digestId));

	await logAudit(db, digest.userId, 'digest_sent', {
		entityType: 'digest',
		entityId: digestId,
		metadata: { digestName: digest.name, itemCount: items.length, recipientEmail: user.email },
	});
};
