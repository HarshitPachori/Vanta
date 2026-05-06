import { senders, unsubscribeJobs } from "@backend/db/schema"
import { getDb } from "@backend/lib/db"
import { logAudit } from "@backend/lib/audit"
import { newId, now } from "@backend/lib/id"
import { requireAuth } from "@backend/middleware/auth"
import { zValidator } from "@hono/zod-validator"
import { and, desc, eq, inArray } from "drizzle-orm"
import { Hono } from "hono"
import { z } from "zod"

const sendersRoute = new Hono<{ Bindings: CloudflareEnv }>()

sendersRoute.get("/", requireAuth, async (c) => {
  const userId  = c.get("userId")
  const db      = getDb(c.env.DB)
  const status  = c.req.query("status")
  const category = c.req.query("category")

  const conditions = [eq(senders.userId, userId)]
  if (status)   conditions.push(eq(senders.status, status as never))
  if (category) conditions.push(eq(senders.category, category as never))

  const rows = await db
    .select()
    .from(senders)
    .where(and(...conditions))
    .orderBy(desc(senders.emailCount))
    .all()

  return c.json({ senders: rows })
})

const unsubSchema = z.object({
  senderIds: z.array(z.string()).min(1).max(100),
})

sendersRoute.post("/unsubscribe", requireAuth, zValidator("json", unsubSchema), async (c) => {
  const userId    = c.get("userId")
  const { senderIds } = c.req.valid("json")
  const db        = getDb(c.env.DB)
  const ts        = now()

  const created: { jobId: string; senderId: string }[] = []

  for (const senderId of senderIds) {
    const sender = await db
      .select({ id: senders.id, status: senders.status, unsubscribeHeader: senders.unsubscribeHeader })
      .from(senders)
      .where(and(eq(senders.id, senderId), eq(senders.userId, userId)))
      .get()

    if (!sender || sender.status === "unsubscribed") continue

    const method = sender.unsubscribeHeader
      ? (sender.unsubscribeHeader.includes("mailto:") ? "header_mailto" : "header_http")
      : "filter"

    const jobId = newId()
    await db.insert(unsubscribeJobs).values({
      id: jobId, userId, senderId, method,
      status: "queued", attempts: 0, createdAt: ts,
    })

    await c.env.UNSUB_QUEUE.send({ jobId, userId, type: "unsub" })
    created.push({ jobId, senderId })
  }

  if (created.length > 0) {
    await logAudit(db, userId, "unsub_requested", {
      metadata: { count: created.length, senderIds: created.map(j => j.senderId) },
    })
  }

  return c.json({ ok: true, jobs: created })
})

sendersRoute.get("/jobs", requireAuth, async (c) => {
  const userId = c.get("userId")
  const ids = (c.req.query("ids") ?? "").split(",").filter(Boolean)
  if (!ids.length) return c.json({ jobs: [] })

  const db = getDb(c.env.DB)
  const jobs = await db
    .select({
      id:           unsubscribeJobs.id,
      senderId:     unsubscribeJobs.senderId,
      status:       unsubscribeJobs.status,
      errorMessage: unsubscribeJobs.errorMessage,
    })
    .from(unsubscribeJobs)
    .where(and(eq(unsubscribeJobs.userId, userId), inArray(unsubscribeJobs.id, ids)))
    .all()

  return c.json({ jobs })
})

export default sendersRoute