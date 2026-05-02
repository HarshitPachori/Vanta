export const dynamic = "force-dynamic"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { verifyToken } from "@backend/lib/jwt"
import { getDb } from "@backend/lib/db"
import { sessions, senders } from "@backend/db/schema"
import { eq, and, gt, desc } from "drizzle-orm"
import type { Metadata } from "next"
import SendersClient from "@/components/dashboard/senders-client"
import { requireOnboarding } from "@/lib/auth"

export const metadata: Metadata = { title: "Senders — Vanta" }

const getData = async () => {
  try {
    const { env }     = getCloudflareContext()
    const cookieStore = await cookies()
    const token       = cookieStore.get("session")?.value
    if (!token) return null

    const payload = await verifyToken<{ sessionId: string }>(token, env.AUTH_JWT_SECRET)
    if (!payload?.sessionId) return null

    const db  = getDb(env.DB)
    const now = Math.floor(Date.now() / 1000)

    const session = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, payload.sessionId), gt(sessions.expiresAt, now)))
      .get()

    if (!session) return null

    const rows = await db
      .select()
      .from(senders)
      .where(eq(senders.userId, session.userId))
      .orderBy(desc(senders.emailCount))
      .all()

    return rows
  } catch {
    return null
  }
}

export default async function SendersPage() {
  await requireOnboarding()
  const data = await getData()
  if (data === null) redirect("/login")

  return (
    <div className="px-5 sm:px-8 py-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display font-bold text-2xl text-(--color-text-primary) tracking-tight">
          Senders
        </h1>
        <p className="text-sm text-(--color-text-muted) mt-1">
          All senders detected in your inbox. Select and unsubscribe in bulk.
        </p>
      </header>
      <SendersClient initialSenders={data} />
    </div>
  )
}