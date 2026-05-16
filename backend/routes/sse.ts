import { Hono } from 'hono';
import { requireAuth } from '@backend/middleware/auth';
import { getDb } from '@backend/lib/db';
import { users, senders } from '@backend/db/schema';
import { eq, count, and } from 'drizzle-orm';

const sse = new Hono<{ Bindings: CloudflareEnv }>();

sse.get('/scan', requireAuth, async (c) => {
	const userId = c.get('userId');
	const db = getDb(c.env.DB);

	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			const send = (event: string, data: unknown) => {
				const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
				controller.enqueue(encoder.encode(payload));
			};

			// poll every 2 seconds, max 120 seconds
			const MAX = 60;
			let ticks = 0;

			const poll = async () => {
				try {
					const user = await db
						.select({
							scanStatus: users.scanStatus,
							lastScannedAt: users.lastScannedAt,
						})
						.from(users)
						.where(eq(users.id, userId))
						.get();

					if (!user) {
						send('error', { message: 'User not found' });
						controller.close();
						return;
					}

					const [totalRow] = await db.select({ count: count() }).from(senders).where(eq(senders.userId, userId));

					const [unsubRow] = await db
						.select({ count: count() })
						.from(senders)
						.where(and(eq(senders.userId, userId), eq(senders.status, 'unsubscribed')));

					send('status', {
						scanStatus: user.scanStatus,
						lastScannedAt: user.lastScannedAt,
						senderCount: totalRow?.count ?? 0,
					});

					if (user.scanStatus === 'done' || user.scanStatus === 'failed' || user.scanStatus === 'token_expired') {
						send('complete', {
							scanStatus: user.scanStatus,
							lastScannedAt: user.lastScannedAt,
							senderCount: totalRow?.count ?? 0,
						});
						cleanup();
						controller.close();
						return;
					}

					ticks++;
					if (ticks >= MAX) {
						send('timeout', {});
						cleanup();
						controller.close();
						return;
					}

					setTimeout(poll, 2000);
				} catch {
					cleanup();
					controller.close();
				}
			};

			// heartbeat to keep connection alive
			let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
			const cleanup = () => {
				if (heartbeatInterval) {
					clearInterval(heartbeatInterval);
					heartbeatInterval = null;
				}
			};
			heartbeatInterval = setInterval(() => {
				try {
					controller.enqueue(encoder.encode(': heartbeat\n\n'));
				} catch {
					cleanup();
				}
			}, 15000);

			await poll();
		},
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no',
		},
	});
});

export default sse;
