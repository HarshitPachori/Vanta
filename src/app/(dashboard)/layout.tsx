export const dynamic = "force-dynamic"

import DashboardShell from "@/components/dashboard/shell"
import { sessions, subscriptions, users } from "@backend/db/schema"
import { getDb } from "@backend/lib/db"
import { verifyToken } from "@backend/lib/jwt"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { and, eq, gt } from "drizzle-orm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const getUser = async () => {
  try {
    const { env }     = getCloudflareContext()
    const cookieStore = await cookies()
    const token       = cookieStore.get("session")?.value
    if (!token) return null

    const payload = await verifyToken<{ sessionId: string }>(
      token, env.AUTH_JWT_SECRET
    )
    if (!payload?.sessionId) return null

    const db  = getDb(env.DB)
    const now = Math.floor(Date.now() / 1000)

    const session = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, payload.sessionId), gt(sessions.expiresAt, now)))
      .get()

    if (!session) return null

    const user = await db
      .select({
        id:             users.id,
        email:          users.email,
        name:           users.name,
        avatarUrl:      users.avatarUrl,
        hasGmailAccess: users.hasGmailAccess,
        scanStatus:     users.scanStatus,
        lastScannedAt:  users.lastScannedAt,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .get()

    if (!user) return null

    const sub = await db
      .select({ plan: subscriptions.plan, status: subscriptions.status })
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .get()

    return { ...user, plan: sub?.plan ?? "free" }
  } catch {
    return null
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  if (!user) redirect("/login")

  return <DashboardShell user={user}>{children}</DashboardShell>
}