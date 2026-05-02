import { users } from "@backend/db/schema"
import { getDb } from "@backend/lib/db"
import { now } from "@backend/lib/id"
import { requireAuth } from "@backend/middleware/auth"
import { eq } from "drizzle-orm"
import { Hono } from "hono"

const scan = new Hono<{ Bindings: CloudflareEnv }>()

scan.post("/", requireAuth, async (c) => {
  const userId = c.get("userId")
  const db     = getDb(c.env.DB)

  const user = await db
    .select({ scanStatus: users.scanStatus, gmailAccessToken: users.gmailAccessToken })
    .from(users)
    .where(eq(users.id, userId))
    .get()

  if (!user?.gmailAccessToken) {
    return c.json({ error: "Gmail not connected. Please sign in with Google." }, 400)
  }

  if (user.scanStatus === "scanning") {
    return c.json({ error: "Scan already in progress." }, 409)
  }

  await c.env.SCAN_QUEUE.send({ userId ,type:'scan'})

  await db
    .update(users)
    .set({ scanStatus: "scanning", updatedAt: now() })
    .where(eq(users.id, userId))

return c.json({ ok: true, status: "scanning" })
})

scan.get("/status", requireAuth, async (c) => {
  const userId = c.get("userId")
  const db     = getDb(c.env.DB)

  const user = await db
    .select({ scanStatus: users.scanStatus, lastScannedAt: users.lastScannedAt })
    .from(users)
    .where(eq(users.id, userId))
    .get()

  return c.json({
    status:        user?.scanStatus ?? "idle",
    lastScannedAt: user?.lastScannedAt ?? null,
  })
})

export default scan