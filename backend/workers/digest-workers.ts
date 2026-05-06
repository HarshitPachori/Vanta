import { eq, and, inArray } from "drizzle-orm"
import { digests, digestSenders, senders, users } from "@backend/db/schema"
import { getDb } from "@backend/lib/db"
import { logAudit } from "@backend/lib/audit"
import { now } from "@backend/lib/id"
import { getValidAccessToken, listMessageIds, batchGetMessageHeaders, getHeader, parseFrom } from "@backend/lib/gmail"
import { buildDigestEmail } from "@backend/lib/digest-email"
import { sendEmail } from "@backend/lib/resend"

export type DigestMessage = { type: "digest"; digestId: string }

const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me"

const getEmailUrl = (messageId: string) =>
  `https://mail.google.com/mail/u/0/#inbox/${messageId}`

export const digestQueue = async (
  msg: DigestMessage,
  env: CloudflareEnv
): Promise<void> => {
  const { digestId } = msg
  const db = getDb(env.DB)

  const digest = await db
    .select()
    .from(digests)
    .where(and(eq(digests.id, digestId), eq(digests.status, "active")))
    .get()

  if (!digest) return

  const user = await db
    .select({
      id:                users.id,
      email:             users.email,
      name:              users.name,
      gmailAccessToken:  users.gmailAccessToken,
      gmailRefreshToken: users.gmailRefreshToken,
      gmailTokenExpiry:  users.gmailTokenExpiry,
    })
    .from(users)
    .where(eq(users.id, digest.userId))
    .get()

  if (!user) return

  const accessToken = await getValidAccessToken(db, user.id, env)
  if (!accessToken) {
    await db
      .update(users)
      .set({ scanStatus: "token_expired", updatedAt: now() })
      .where(eq(users.id, user.id))
    return
  }

  // get digest sender emails
  const ds = await db
    .select({ senderId: digestSenders.senderId })
    .from(digestSenders)
    .where(eq(digestSenders.digestId, digestId))
    .all()

  if (ds.length === 0) return

  const senderIds    = ds.map(d => d.senderId)
  const senderRows   = await db
    .select({ email: senders.email, displayName: senders.displayName })
    .from(senders)
    .where(inArray(senders.id, senderIds))
    .all()

  if (senderRows.length === 0) return

  // build Gmail query — emails from digest senders since last sent
  const sinceTs = digest.lastSentAt
    ? digest.lastSentAt
    : Math.floor(Date.now() / 1000) - 86400 // 24h ago

  const fromQuery  = senderRows.map(s => `from:${s.email}`).join(" OR ")
  const query      = `(${fromQuery}) after:${sinceTs}`

  const messageIds = await listMessageIds(accessToken, query, 50)
  if (messageIds.length === 0) return

  const details = await batchGetMessageHeaders(accessToken, messageIds)

  // build digest items
  const items = details
    .map(detail => {
      const fromHeader    = getHeader(detail.payload.headers, "From")
      const subjectHeader = getHeader(detail.payload.headers, "Subject") ?? "(no subject)"
      const dateHeader    = getHeader(detail.payload.headers, "Date") ?? ""

      if (!fromHeader) return null

      const { displayName } = parseFrom(fromHeader)
      const date = dateHeader
        ? new Date(dateHeader).toLocaleDateString("en-US", {
            month: "short", day: "numeric",
          })
        : ""

      return {
        from:    displayName,
        subject: subjectHeader,
        date,
        url:     getEmailUrl(detail.id),
      }
    })
    .filter(Boolean) as { from: string; subject: string; date: string; url: string }[]

  if (items.length === 0) return

  // build + send email
  const deliveryDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  })

  const { html, text } = buildDigestEmail({
    userName:    user.name,
    digestName:  digest.name,
    items,
    deliveryDate,
    clientBaseUrl: env.CLIENT_BASE_URI
  })

  const sent = await sendEmail(
    {
      to:      user.email,
      from:    env.RESEND_FROM_EMAIL,
      subject: `${digest.name} — ${deliveryDate}`,
      html,
      text,
    },
    env.RESEND_API_KEY
  )

  if (!sent) throw new Error("Failed to send digest email")

  await db
    .update(digests)
    .set({ lastSentAt: now(), updatedAt: now() })
    .where(eq(digests.id, digestId))

  await logAudit(db, digest.userId, "digest_sent", {
    entityType: "digest",
    entityId:   digestId,
    metadata:   { digestName: digest.name, itemCount: items.length, recipientEmail: user.email },
  })
}