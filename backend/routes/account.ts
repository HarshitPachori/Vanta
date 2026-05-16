import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@backend/middleware/auth';
import { getDb } from '@backend/lib/db';
import { users, sessions, senders, unsubscribeJobs, digests, digestSenders, subscriptions } from '@backend/db/schema';
import { now } from '@backend/lib/id';
import { deleteCookie } from 'hono/cookie';

const account = new Hono<{ Bindings: CloudflareEnv }>();

account.delete('/', requireAuth, async (c) => {
	const userId = c.get('userId');
	const db = getDb(c.env.DB);
	const ts = now();

	// get all digest ids for user first
	const userDigests = await db.select({ id: digests.id }).from(digests).where(eq(digests.userId, userId)).all();

	// delete digest_senders for each digest
	for (const d of userDigests) {
		await db.delete(digestSenders).where(eq(digestSenders.digestId, d.id));
	}

	await db.delete(digests).where(eq(digests.userId, userId));
	await db.delete(unsubscribeJobs).where(eq(unsubscribeJobs.userId, userId));
	await db.delete(senders).where(eq(senders.userId, userId));
	await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
	await db.delete(sessions).where(eq(sessions.userId, userId));

	// soft delete — wipe sensitive data but keep row for audit
	await db
		.update(users)
		.set({
			deletedAt: ts,
			updatedAt: ts,
			gmailAccessToken: null,
			gmailRefreshToken: null,
			passwordHash: null,
			email: `deleted_${userId}@vanta.deleted`,
		})
		.where(eq(users.id, userId));

	deleteCookie(c, 'session', { path: '/' });
	return c.json({ ok: true });
});

export default account;
