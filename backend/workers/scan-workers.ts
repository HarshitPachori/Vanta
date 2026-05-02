import { senders, users } from "@backend/db/schema"
import { getDb } from "@backend/lib/db"
import {
  batchGetMessageHeaders,
  categorizeSender,
  getHeader,
  getValidAccessToken,
  listMessageIds,
  parseFrom,
  parseUnsubscribeHeader,
} from "@backend/lib/gmail"
import { newId, now } from "@backend/lib/id"
import { and, eq } from "drizzle-orm"

export type ScanMessage = { type: "scan"; userId: string }

export const scanQueue = async (
  msg: ScanMessage,
  env: CloudflareEnv
): Promise<void> => {
  console.log({msg});
  
  const { userId } = msg
  const db = getDb(env.DB)

  await db
    .update(users)
    .set({ scanStatus: "scanning", updatedAt: now() })
    .where(eq(users.id, userId))

  const accessToken = await getValidAccessToken(db, userId, env)
  if (!accessToken) {
    await db
      .update(users)
      .set({ scanStatus: "token_expired", updatedAt: now() })
      .where(eq(users.id, userId))
    return
  }

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const query = `after:${Math.floor(ninetyDaysAgo.getTime() / 1000)}`
console.log({query});

  const messageIds = await listMessageIds(accessToken, query, 2000)
  const details    = await batchGetMessageHeaders(accessToken, messageIds)

  const senderMap = new Map<string, {
    email:             string
    displayName:       string
    emailCount:        number
    lastReceivedAt:    number
    unsubscribeHeader?: string
    unsubscribeUrl?:   string
  }>()

  console.log({senderMap});
  

  for (const detail of details) {
    console.log({detail});
    
    const fromHeader = getHeader(detail.payload.headers, "From")
    if (!fromHeader) continue

    const { email, displayName } = parseFrom(fromHeader)
    const unsubHeader = getHeader(detail.payload.headers, "List-Unsubscribe")
    const receivedAt  = Math.floor(Number(detail.internalDate) / 1000)
    const existing    = senderMap.get(email)

    if (existing) {
      existing.emailCount++
      if (receivedAt > existing.lastReceivedAt) {
        existing.lastReceivedAt = receivedAt
        if (unsubHeader) existing.unsubscribeHeader = unsubHeader
      }
    } else {
      const unsub = unsubHeader ? parseUnsubscribeHeader(unsubHeader) : {}
      senderMap.set(email, {
        email,
        displayName,
        emailCount:        1,
        lastReceivedAt:    receivedAt,
        unsubscribeHeader: unsubHeader,
        unsubscribeUrl:    unsub.http,
      })
    }
  }

  const ts = now()

  for (const [, s] of senderMap) {
    const category = categorizeSender(s.email, s.displayName, !!s.unsubscribeHeader)

const existing = await db
  .select({ id: senders.id })
  .from(senders)
  .where(and(eq(senders.userId, userId), eq(senders.email, s.email)))
  .get()

    if (existing) {
      await db
        .update(senders)
        .set({
          emailCount:        s.emailCount,
          lastReceivedAt:    s.lastReceivedAt,
          unsubscribeHeader: s.unsubscribeHeader,
          unsubscribeUrl:    s.unsubscribeUrl,
          category,
          updatedAt:         ts,
        })
        .where(eq(senders.id, existing.id))
    } else {
      await db.insert(senders).values({
        id:                newId(),
        userId,
        email:             s.email,
        displayName:       s.displayName,
        category,
        emailCount:        s.emailCount,
        lastReceivedAt:    s.lastReceivedAt,
        unsubscribeHeader: s.unsubscribeHeader,
        unsubscribeUrl:    s.unsubscribeUrl,
        createdAt:         ts,
        updatedAt:         ts,
      })
    }
  }

  await db
    .update(users)
    .set({ scanStatus: "done", lastScannedAt: ts, updatedAt: ts })
    .where(eq(users.id, userId))
}