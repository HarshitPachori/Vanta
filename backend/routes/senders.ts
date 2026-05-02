import { senders, unsubscribeJobs } from "@backend/db/schema"
import { getDb } from "@backend/lib/db"
import { newId, now } from "@backend/lib/id"
import { requireAuth } from "@backend/middleware/auth"
import { zValidator } from "@hono/zod-validator"
import { and, desc, eq } from "drizzle-orm"
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

  const created: string[] = []

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

    await c.env.UNSUB_QUEUE.send({ jobId, userId , type:'unsub'})
    created.push(jobId)
  }

  return c.json({ ok: true, jobsCreated: created.length })
})

export default sendersRoute