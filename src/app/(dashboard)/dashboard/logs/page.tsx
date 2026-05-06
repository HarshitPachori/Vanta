export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb } from "@backend/lib/db"
import { auditLogs } from "@backend/db/schema"
import { eq, desc } from "drizzle-orm"
import { getUser, requireOnboarding } from "@/lib/auth"
import {
  cn, cardSection,
  tableHeaderCell, tableRow, tableCell,
  pillSuccess, pillDanger, pillNeutral, pillAccent,
} from "@/lib/cn"
import { CheckCircle, XCircle, RefreshCw, Trash2, Layers, Mail, Send } from "lucide-react"
import type { Metadata } from "next"
import EmptyState from "@/components/dashboard/empty-state"

export const metadata: Metadata = { title: "Activity — Vanta" }

type AuditAction = typeof auditLogs.$inferSelect["action"]

const ACTION_META: Record<AuditAction, { label: string; pill: string; Icon: React.ElementType }> = {
  scan_started:    { label: "Scan started",    pill: pillNeutral, Icon: RefreshCw },
  scan_done:       { label: "Scan complete",   pill: pillSuccess, Icon: CheckCircle },
  scan_failed:     { label: "Scan failed",     pill: pillDanger,  Icon: XCircle },
  unsub_requested: { label: "Unsub requested", pill: pillNeutral, Icon: Trash2 },
  unsub_done:      { label: "Unsubscribed",    pill: pillSuccess, Icon: CheckCircle },
  unsub_failed:    { label: "Unsub failed",    pill: pillDanger,  Icon: XCircle },
  digest_add:      { label: "Added to digest", pill: pillAccent,  Icon: Layers },
  digest_sent:     { label: "Digest sent",     pill: pillSuccess, Icon: Send },
}

const getDetails = (action: AuditAction, raw: string | null): string => {
  if (!raw) return "—"
  try {
    const m = JSON.parse(raw) as Record<string, unknown>
    switch (action) {
      case "scan_done":       return `Found ${Number(m.senderCount).toLocaleString()} senders`
      case "scan_failed":     return `Reason: ${m.reason ?? "unknown"}`
      case "unsub_requested": return `${m.count} sender${m.count !== 1 ? "s" : ""} queued`
      case "unsub_done":      return m.displayName ? `${m.displayName} <${m.email}>` : String(m.email ?? "—")
      case "unsub_failed":    return `${m.email} — ${m.error ?? "unknown error"}`
      case "digest_add":      return `${m.count} sender${m.count !== 1 ? "s" : ""} added`
      case "digest_sent":     return `${m.digestName} — ${m.itemCount} email${m.itemCount !== 1 ? "s" : ""}`
      default:                return "—"
    }
  } catch {
    return "—"
  }
}

const formatTs = (ts: number): string =>
  new Date(ts * 1000).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  })

const getData = async () => {
  try {
    const user = await getUser()
    if (!user) return null
    const { env } = getCloudflareContext()
    const db = getDb(env.DB)
    return db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, user.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(100)
      .all()
  } catch {
    return null
  }
}

export default async function LogsPage() {
  await requireOnboarding()
  const logs = await getData()
  if (logs === null) redirect("/login")

  return (
    <div className="px-5 sm:px-8 py-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display font-bold text-2xl text-(--color-text-primary) tracking-tight">
          Activity
        </h1>
        <p className="text-sm text-(--color-text-muted) mt-1">
          Audit log of all actions — last 100 entries, auto-cleared after 48 hours.
        </p>
      </header>

      {logs.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No activity yet"
          description="Actions like scans, unsubscribes, and digest sends will appear here."
        />
      ) : (
        <div className={cn(cardSection, "overflow-hidden")}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-(--color-border)">
                <th className={tableHeaderCell}>Action</th>
                <th className={cn(tableHeaderCell, "hidden sm:table-cell")}>Details</th>
                <th className={cn(tableHeaderCell, "text-right")}>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const meta = ACTION_META[log.action]
                const { Icon } = meta
                return (
                  <tr key={log.id} className={tableRow}>
                    <td className={tableCell}>
                      <span className={cn(meta.pill, "gap-1.5")}>
                        <Icon size={10} aria-hidden="true" />
                        {meta.label}
                      </span>
                    </td>
                    <td className={cn(tableCell, "hidden sm:table-cell text-(--color-text-muted) font-mono text-[11px] max-w-xs truncate")}>
                      {getDetails(log.action, log.metadata)}
                    </td>
                    <td className={cn(tableCell, "text-right font-mono text-[11px] text-(--color-text-muted) whitespace-nowrap")}>
                      {formatTs(log.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="px-4 py-2.5 border-t border-(--color-border)">
            <p className="text-[11px] font-mono text-(--color-text-muted)">
              {logs.length} entries
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
