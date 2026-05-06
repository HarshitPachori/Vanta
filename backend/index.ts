import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { logger } from "hono/logger";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import authRouter from "@backend/routes/auth";
import scanRouter from "@backend/routes/scan";
import sendersRouter from "@backend/routes/senders";
import accountRouter from "@backend/routes/account";
import digestRouter from "@backend/routes/digest";
import sessionsRouter from "@backend/routes/sessions";
import sseRouter from "@backend/routes/sse";
import auditRouter from "@backend/routes/audit";
import mainRouter from "@backend/routes";
import { globalErrorHandler } from "@backend/middleware/globalErrorHandler";
import { rateLimiter } from "hono-rate-limiter"

const app = new Hono<{ Bindings: CloudflareEnv }>();

app.use("*", logger());
app.use("*", secureHeaders());

// ←←←  IMPORTANT: Put env fixing middleware FIRST (before CORS)
app.use("*", async (c, next) => {
  if (!c.env || Object.keys(c.env).length === 0 || !c.env.AUTH_JWT_SECRET) {
    try {
      const context = getCloudflareContext();
      c.env = { ...(c.env || {}), ...context.env };
    } catch (e) {
      console.warn("Failed to get Cloudflare context in middleware", e);
    }
  }
  await next();
});

// Now CORS can safely access c.env
app.use(
  "/api/*",
  cors({
    origin: (origin, c) => {
      const base = c.env?.CLIENT_BASE_URI;
      if (!base) {
        console.warn("CLIENT_BASE_URI is not set in env");
        return null;
      }
      return origin === base ? origin : null;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

const authRateLimiter = rateLimiter({
  windowMs:  60 * 1000,
  limit:     10,
  keyGenerator: (c) =>
    c.req.header("CF-Connecting-IP") ??
    c.req.header("X-Forwarded-For") ??
    "unknown",
  handler: (c) =>
    c.json({ error: "Too many attempts. Please try again in a minute." }, 429),
})


app.use("/api/auth/login",           authRateLimiter)
app.use("/api/auth/signup",          authRateLimiter)
app.use("/api/auth/forgot-password", authRateLimiter)

// Routes
app.route("/api/auth", authRouter);
app.route("/api/scan", scanRouter);
app.route("/api/senders", sendersRouter);
app.route("/api/account", accountRouter)
app.route("/api/digest", digestRouter)
app.route("/api/sessions", sessionsRouter)
app.route("/api/sse", sseRouter)
app.route("/api/audit", auditRouter)

app.get("/api/health", (c) => 
  c.json({ ok: true, environment: c.env?.ENVIRONMENT })
);

app.use("*", async (c, next) => {
  // Optional second pass if needed in deeper routes
  await next();
});

app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError(globalErrorHandler);
app.route("/", mainRouter);

export default app;