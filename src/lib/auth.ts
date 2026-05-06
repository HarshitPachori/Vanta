export const dynamic = "force-dynamic"

import { cache } from "react"
import { cookies } from "next/headers"
import { verifyToken } from "@backend/lib/jwt"
import { getDb } from "@backend/lib/db"
import { sessions, users, subscriptions } from "@backend/db/schema"
import { and, eq, gt } from "drizzle-orm"
import { getCloudflareContext } from "@opennextjs/cloudflare"

export type AuthUser = {
  id: string
  email: string | null
  name: string | null
  avatarUrl: string | null
  hasGmailAccess: boolean | null
  scanStatus: string | null
  lastScannedAt: number | null
  createdAt: number | null
  plan: string
  sessionId: string
}

// Cached per request — layout + requireOnboarding + every page getData share one fetch
export const getUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const { env } = getCloudflareContext()
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value
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

    const [user, sub] = await Promise.all([
      db
        .select({
          id:             users.id,
          email:          users.email,
          name:           users.name,
          avatarUrl:      users.avatarUrl,
          hasGmailAccess: users.hasGmailAccess,
          scanStatus:     users.scanStatus,
          lastScannedAt:  users.lastScannedAt,
          createdAt:      users.createdAt,
        })
        .from(users)
        .where(eq(users.id, session.userId))
        .get(),
      db
        .select({ plan: subscriptions.plan })
        .from(subscriptions)
        .where(eq(subscriptions.userId, session.userId))
        .get(),
    ])

    if (!user) return null

    return { ...user, plan: sub?.plan ?? "free", sessionId: session.id }
  } catch {
    return null
  }
})

export const isLoggedIn = async (): Promise<boolean> => !!(await getUser())

export const getAuthStatus = async (): Promise<{ loggedIn: boolean; onboarded: boolean }> => {
  const user = await getUser()
  return {
    loggedIn:  !!user,
    onboarded: !!(user?.hasGmailAccess && user?.scanStatus === "done"),
  }
}

export const requireOnboarding = async (): Promise<void> => {
  const { redirect } = await import("next/navigation")
  const user = await getUser()
  if (!user) { redirect("/login"); return }
  if (!(user.hasGmailAccess && user.scanStatus === "done")) redirect("/onboarding")
}
