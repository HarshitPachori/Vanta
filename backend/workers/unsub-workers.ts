import { senders, unsubscribeJobs } from "@backend/db/schema"
import { getDb } from "@backend/lib/db"
import {
  createGmailFilter,
  getValidAccessToken,
  parseUnsubscribeHeader,
} from "@backend/lib/gmail"
import { now } from "@backend/lib/id"
import { and, eq } from "drizzle-orm"

export type UnsubMessage = { type: "unsub"; jobId: string; userId: string }

const MAX_ATTEMPTS = 3

export const unsubQueue = async (
  msg: UnsubMessage,
  env: CloudflareEnv
): Promise<void> => {
  const { jobId, userId } = msg
  const db = getDb(env.DB)

  const job = await db
    .select()
    .from(unsubscribeJobs)
    .where(eq(unsubscribeJobs.id, jobId))
    .get()

  if (!job || job.status === "done") return

  if (job.attempts >= MAX_ATTEMPTS) {
    await db
      .update(unsubscribeJobs)
      .set({ status: "failed", errorMessage: "Max attempts reached", lastAttemptAt: now() })
      .where(eq(unsubscribeJobs.id, jobId))
    return
  }

  await db
    .update(unsubscribeJobs)
    .set({ status: "processing", attempts: job.attempts + 1, lastAttemptAt: now() })
    .where(eq(unsubscribeJobs.id, jobId))

  const sender = await db
    .select()
    .from(senders)
    .where(and(eq(senders.id, job.senderId), eq(senders.userId, userId)))
    .get()

  if (!sender) throw new Error("Sender not found")

  const accessToken = await getValidAccessToken(db, userId, env)
  if (!accessToken) throw new Error("No valid access token")

  let success = false

  if (sender.unsubscribeHeader) {
    const { mailto, http } = parseUnsubscribeHeader(sender.unsubscribeHeader)

    if (http) {
      const res = await fetch(http, {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:    "List-Unsubscribe=One-Click",
      })
      success = res.ok
    }

    if (!success && mailto) {
      const to  = mailto.replace("mailto:", "").split("?")[0]
      const raw = btoa(`To: ${to}\r\nSubject: Unsubscribe\r\n\r\nUnsubscribe`)
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

      const res = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
          method:  "POST",
          headers: {
            Authorization:  `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw }),
        }
      )
      success = res.ok
    }
  }

  if (!success) {
    success = await createGmailFilter(accessToken, sender.email)
  }

  if (!success) throw new Error("All unsubscribe methods failed")

  await db
    .update(unsubscribeJobs)
    .set({ status: "done", completedAt: now() })
    .where(eq(unsubscribeJobs.id, jobId))

  await db
    .update(senders)
    .set({ status: "unsubscribed", updatedAt: now() })
    .where(eq(senders.id, job.senderId))
}