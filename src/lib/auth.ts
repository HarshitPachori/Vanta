export const dynamic = "force-dynamic"

import { cookies } from "next/headers"
import { verifyToken } from "@backend/lib/jwt"
import { getDb } from "@backend/lib/db"
import { sessions, users } from "@backend/db/schema"
import { and, eq, gt } from "drizzle-orm"

export const getAuthStatus = async (): Promise<{
  loggedIn: boolean
  onboarded: boolean
}> => {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare")
    const { env }     = getCloudflareContext()
    const cookieStore = await cookies()
    const token       = cookieStore.get("session")?.value
    if (!token) return { loggedIn: false, onboarded: false }

    const payload = await verifyToken<{ sessionId: string }>(token, env.AUTH_JWT_SECRET)
    if (!payload?.sessionId) return { loggedIn: false, onboarded: false }

    const db  = getDb(env.DB)
    const now = Math.floor(Date.now() / 1000)

    const session = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, payload.sessionId), gt(sessions.expiresAt, now)))
      .get()

    if (!session) return { loggedIn: false, onboarded: false }

    const user = await db
      .select({ hasGmailAccess: users.hasGmailAccess, scanStatus: users.scanStatus })
      .from(users)
      .where(eq(users.id, session.userId))
      .get()

    const onboarded = !!(user?.hasGmailAccess && user?.scanStatus === "done")

    return { loggedIn: true, onboarded }
  } catch {
    return { loggedIn: false, onboarded: false }
  }
}

// keep isLoggedIn as simple wrapper
export const isLoggedIn = async (): Promise<boolean> => {
  const { loggedIn } = await getAuthStatus()
  return loggedIn
}

export const requireOnboarding = async (): Promise<void> => {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare")
  const { redirect }             = await import("next/navigation")

  try {
    const { env }     = getCloudflareContext()
    const cookieStore = await cookies()
    const token       = cookieStore.get("session")?.value
    if (!token) { redirect("/login"); return }

    const payload = await verifyToken<{ sessionId: string }>(token, env.AUTH_JWT_SECRET)
    if (!payload?.sessionId) { redirect("/login"); return }

    const db  = getDb(env.DB)
    const now = Math.floor(Date.now() / 1000)

    const session = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, payload.sessionId), gt(sessions.expiresAt, now)))
      .get()

    if (!session) { redirect("/login"); return }

    const user = await db
      .select({ hasGmailAccess: users.hasGmailAccess, scanStatus: users.scanStatus })
      .from(users)
      .where(eq(users.id, session.userId))
      .get()

    const onboarded = user?.hasGmailAccess && user?.scanStatus === "done"
    if (!onboarded) redirect("/onboarding")
  } catch (err) {
    // redirect throws — rethrow it
    throw err
  }
}