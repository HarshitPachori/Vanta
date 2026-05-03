import { sessions, users } from "@backend/db/schema"
import { getDb } from "@backend/lib/db"
import { verifyToken } from "@backend/lib/jwt"
import { and, eq, gt } from "drizzle-orm"
import { getCookie } from "hono/cookie"
import { createMiddleware } from "hono/factory"

type AuthVars = {
  userId: string
  sessionId: string
  user: typeof users.$inferSelect
}

export const requireAuth = createMiddleware<{
  Bindings: CloudflareEnv
  Variables: AuthVars
}>(async (c, next) => {
  const token = getCookie(c, "session")
  if (!token) return c.json({ error: "Unauthorized" }, 401)

  const payload = await verifyToken<{ sessionId: string }>(
    token,
    c.env.AUTH_JWT_SECRET
  )
  if (!payload?.sessionId) return c.json({ error: "Unauthorized" }, 401)

  const db = getDb(c.env.DB)
  const nowSec = Math.floor(Date.now() / 1000)

  const session = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, payload.sessionId),
        gt(sessions.expiresAt, nowSec)
      )
    )
    .get()

  if (!session) return c.json({ error: "Session expired" }, 401)

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .get()

  if (!user || user.deletedAt) return c.json({ error: "Unauthorized" }, 401)

  c.set("userId", user.id)
  c.set("sessionId", session.id)
  c.set("user", user)
  await next()
})