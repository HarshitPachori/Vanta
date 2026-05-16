import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@backend/middleware/auth';
import { getDb } from '@backend/lib/db';
import { logAudit } from '@backend/lib/audit';
import { digests, digestSenders, senders } from '@backend/db/schema';
import { newId, now } from '@backend/lib/id';

const digestRoute = new Hono<{ Bindings: CloudflareEnv }>();

const upsertSchema = z.object({
	name: z.string().min(1).max(100).trim().default('My Digest'),
	deliveryTime: z
		.string()
		.regex(/^\d{2}:\d{2}$/)
		.default('08:00'),
	timezone: z.string().min(1).max(100).default('UTC'),
	frequency: z.enum(['daily', 'weekdays', 'weekly']).default('daily'),
	senderIds: z.array(z.string()).max(50).default([]),
});

const addSendersSchema = z.object({
	senderIds: z.array(z.string()).min(1).max(50),
});

// get digest config + senders
digestRoute.get('/', requireAuth, async (c) => {
	const userId = c.get('userId');
	const db = getDb(c.env.DB);

	const digest = await db
		.select()
		.from(digests)
		.where(and(eq(digests.userId, userId), eq(digests.status, 'active')))
		.get();

	if (!digest) return c.json({ digest: null, senders: [] });

	const ds = await db
		.select({
			id: senders.id,
			email: senders.email,
			displayName: senders.displayName,
			category: senders.category,
			emailCount: senders.emailCount,
		})
		.from(digestSenders)
		.innerJoin(senders, eq(digestSenders.senderId, senders.id))
		.where(eq(digestSenders.digestId, digest.id))
		.all();

	return c.json({ digest, senders: ds });
});

// create or update digest
digestRoute.put('/', requireAuth, zValidator('json', upsertSchema), async (c) => {
	const userId = c.get('userId');
	const body = c.req.valid('json');
	const db = getDb(c.env.DB);
	const ts = now();

	let digest = await db.select().from(digests).where(eq(digests.userId, userId)).get();

	if (digest) {
		await db
			.update(digests)
			.set({
				name: body.name,
				deliveryTime: body.deliveryTime,
				timezone: body.timezone,
				frequency: body.frequency,
				updatedAt: ts,
			})
			.where(eq(digests.id, digest.id));
	} else {
		const digestId = newId();
		await db.insert(digests).values({
			id: digestId,
			userId,
			name: body.name,
			deliveryTime: body.deliveryTime,
			timezone: body.timezone,
			frequency: body.frequency,
			status: 'active',
			createdAt: ts,
			updatedAt: ts,
		});
		digest = await db.select().from(digests).where(eq(digests.id, digestId)).get();
	}

	if (!digest) return c.json({ error: 'Failed to save digest.' }, 500);

	// replace digest senders
	await db.delete(digestSenders).where(eq(digestSenders.digestId, digest.id));

	if (body.senderIds.length > 0) {
		for (const senderId of body.senderIds) {
			// verify sender belongs to user
			const sender = await db
				.select({ id: senders.id })
				.from(senders)
				.where(and(eq(senders.id, senderId), eq(senders.userId, userId)))
				.get();

			if (!sender) continue;

			await db.insert(digestSenders).values({
				digestId: digest.id,
				senderId: sender.id,
				createdAt: ts,
			});

			// mark sender status
			await db.update(senders).set({ status: 'in_digest', updatedAt: ts }).where(eq(senders.id, sender.id));
		}
	}

	return c.json({ ok: true, digestId: digest.id });
});

// pause / resume
digestRoute.patch(
	'/status',
	requireAuth,
	zValidator(
		'json',
		z.object({
			status: z.enum(['active', 'paused']),
		}),
	),
	async (c) => {
		const userId = c.get('userId');
		const { status } = c.req.valid('json');
		const db = getDb(c.env.DB);

		await db.update(digests).set({ status, updatedAt: now() }).where(eq(digests.userId, userId));

		return c.json({ ok: true });
	},
);

digestRoute.post('/senders', requireAuth, zValidator('json', addSendersSchema), async (c) => {
	const userId = c.get('userId');
	const { senderIds } = c.req.valid('json');
	const db = getDb(c.env.DB);
	const ts = now();

	// get or create digest
	let digest = await db.select().from(digests).where(eq(digests.userId, userId)).get();

	if (!digest) {
		const digestId = newId();
		await db.insert(digests).values({
			id: digestId,
			userId,
			name: 'My Digest',
			deliveryTime: '08:00',
			timezone: 'UTC',
			frequency: 'daily',
			status: 'active',
			createdAt: ts,
			updatedAt: ts,
		});
		digest = await db.select().from(digests).where(eq(digests.id, digestId)).get();
	}

	if (!digest) return c.json({ error: 'Failed to create digest.' }, 500);

	for (const senderId of senderIds) {
		const sender = await db
			.select({ id: senders.id })
			.from(senders)
			.where(and(eq(senders.id, senderId), eq(senders.userId, userId)))
			.get();

		if (!sender) continue;

		// upsert — ignore if already in digest
		const existing = await db
			.select()
			.from(digestSenders)
			.where(and(eq(digestSenders.digestId, digest.id), eq(digestSenders.senderId, sender.id)))
			.get();

		if (!existing) {
			await db.insert(digestSenders).values({
				digestId: digest.id,
				senderId: sender.id,
				createdAt: ts,
			});
		}

		await db.update(senders).set({ status: 'in_digest', updatedAt: ts }).where(eq(senders.id, sender.id));
	}

	await logAudit(db, userId, 'digest_add', {
		entityType: 'digest',
		entityId: digest.id,
		metadata: { count: senderIds.length, senderIds },
	});

	return c.json({ ok: true });
});

// DEV ONLY — trigger digest send directly, bypasses scheduler time gate
digestRoute.post('/test-send', requireAuth, async (c) => {
	if (c.env.ENVIRONMENT !== 'DEV') return c.json({ error: 'Not available in prod' }, 403);

	const userId = c.get('userId');
	const db = getDb(c.env.DB);

	const digest = await db
		.select()
		.from(digests)
		.where(and(eq(digests.userId, userId), eq(digests.status, 'active')))
		.get();

	if (!digest) return c.json({ error: 'No active digest found' }, 404);

	// reset lastSentAt so the 7-day lookback window is used
	await db.update(digests).set({ lastSentAt: null }).where(eq(digests.id, digest.id));

	const { digestQueue } = await import('@backend/workers/digest-workers');
	await digestQueue({ type: 'digest', digestId: digest.id }, c.env);

	return c.json({ ok: true, digestId: digest.id });
});

export default digestRoute;
