import { Hono } from 'hono';

const mainRouter = new Hono<{ Bindings: CloudflareEnv }>();

mainRouter.get('/health', async (c) => {
	return c.json({
		status: 'OK',
		environment: c.env.ENVIRONMENT,
		timestamp: Date.now(),
	});
});

export default mainRouter;
