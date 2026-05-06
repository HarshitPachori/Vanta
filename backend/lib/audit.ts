import { auditLogs } from "@backend/db/schema"
import { newId, now } from "@backend/lib/id"
import type { getDb } from "@backend/lib/db"

export type AuditAction =
  | "scan_started" | "scan_done" | "scan_failed"
  | "unsub_requested" | "unsub_done" | "unsub_failed"
  | "digest_add" | "digest_sent"

export const logAudit = async (
  db: ReturnType<typeof getDb>,
  userId: string,
  action: AuditAction,
  options: {
    entityType?: string
    entityId?: string
    metadata?: Record<string, unknown>
  } = {}
): Promise<void> => {
  try {
    await db.insert(auditLogs).values({
      id:         newId(),
      userId,
      action,
      entityType: options.entityType ?? null,
      entityId:   options.entityId ?? null,
      metadata:   options.metadata ? JSON.stringify(options.metadata) : null,
      createdAt:  now(),
    })
  } catch (err) {
    console.error("[audit] failed to log", action, err)
  }
}
