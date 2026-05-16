import { auditLogs } from '@backend/db/schema';
import { getDb } from '@backend/lib/db';
import { requireAuth } from '@backend/middleware/auth';
import { desc, eq } from 'drizzle-orm';
import { Hono } from 'hono';

const auditRoute = new Hono<{ Bindings: CloudflareEnv }>();

auditRoute.get('/', requireAuth, async (c) => {
	const userId = c.get('userId');
	const db = getDb(c.env.DB);

	const logs = await db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).orderBy(desc(auditLogs.createdAt)).limit(100).all();

	return c.json({ logs });
});

export default auditRoute;
