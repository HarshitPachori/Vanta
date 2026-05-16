import { sessions } from '@backend/db/schema';
import { getDb } from '@backend/lib/db';
import { now } from '@backend/lib/id';
import { requireAuth } from '@backend/middleware/auth';
import { and, eq, gt } from 'drizzle-orm';
import { Hono } from 'hono';

const sessionsRoute = new Hono<{ Bindings: CloudflareEnv }>();

sessionsRoute.get('/', requireAuth, async (c) => {
	const userId = c.get('userId');
	const currentSessionId = c.get('sessionId');
	const db = getDb(c.env.DB);

	const rows = await db
		.select({
			id: sessions.id,
			ipAddress: sessions.ipAddress,
			userAgent: sessions.userAgent,
			country: sessions.country,
			city: sessions.city,
			createdAt: sessions.createdAt,
			expiresAt: sessions.expiresAt,
		})
		.from(sessions)
		.where(and(eq(sessions.userId, userId), gt(sessions.expiresAt, now())))
		.all();

	return c.json({
		sessions: rows.map((s) => ({ ...s, isCurrent: s.id === currentSessionId })),
	});
});

sessionsRoute.delete('/:id', requireAuth, async (c) => {
	const userId = c.get('userId');
	const currentSessionId = c.get('sessionId');
	const id = c.req.param('id');

	if (id === currentSessionId) {
		return c.json({ error: 'Use logout to end the current session.' }, 400);
	}

	const db = getDb(c.env.DB);
	await db.delete(sessions).where(and(eq(sessions.id, id), eq(sessions.userId, userId)));

	return c.json({ ok: true });
});

export default sessionsRoute;
