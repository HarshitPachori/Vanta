"use client"

import { parseUA } from "@/lib/parse-ua"
import { iconSquare } from "@/lib/cn"
import { cn } from "@/lib/cn"
import { Monitor, Smartphone, Tablet } from "lucide-react"
import { useState } from "react"

type Session = {
  id: string
  ipAddress: string | null
  userAgent: string | null
  country: string | null
  city: string | null
  createdAt: number
  isCurrent: boolean
}

function countryFlag(code: string | null) {
  if (!code || code.length !== 2) return ""
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)),
  )
}

function relativeTime(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function DeviceIcon({ ua }: { ua: string | null | undefined }) {
  if (ua?.includes("iPhone") || (ua?.includes("Android") && !ua?.includes("Tablet")))
    return <Smartphone size={15} />
  if (ua?.includes("iPad") || ua?.includes("Tablet"))
    return <Tablet size={15} />
  return <Monitor size={15} />
}

export function SessionsList({ sessions: initial }: { sessions: Session[] }) {
  const [sessions, setSessions] = useState(initial)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [revoking, setRevoking] = useState<string | null>(null)

  const revoke = async (id: string) => {
    setRevoking(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
    setConfirming(null)
    try {
      await fetch(`/api/sessions/${id}`, { method: "DELETE", credentials: "include" })
    } catch {
      // revert on error
      setSessions(initial)
    } finally {
      setRevoking(null)
    }
  }

  const revokeAll = async () => {
    const others = sessions.filter((s) => !s.isCurrent)
    setSessions((prev) => prev.filter((s) => s.isCurrent))
    await Promise.all(
      others.map((s) =>
        fetch(`/api/sessions/${s.id}`, { method: "DELETE", credentials: "include" }),
      ),
    )
  }

  const otherCount = sessions.filter((s) => !s.isCurrent).length

  if (sessions.length === 0) {
    return (
      <p className="text-xs text-(--color-text-muted) py-2">No active sessions found.</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {sessions.map((s) => {
          const { browser, os } = parseUA(s.userAgent)
          const flag = countryFlag(s.country)
          const location = [s.city, s.country ? `${flag} ${s.country}` : null]
            .filter(Boolean)
            .join(", ")
          const isLoopback = s.ipAddress === "::1" || s.ipAddress === "127.0.0.1"
          const displayIp = isLoopback ? "Localhost" : s.ipAddress

          const isConfirming = confirming === s.id

          return (
            <li
              key={s.id}
              className={cn(
                "flex items-start justify-between gap-4 px-4 py-3.5 rounded-xl border transition-colors duration-150",
                s.isCurrent
                  ? "bg-(--color-accent-muted) border-(--color-accent-border)"
                  : "bg-(--color-surface-2) border-(--color-border) hover:border-(--color-surface-3)",
              )}>
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={cn(
                    iconSquare(
                      s.isCurrent
                        ? "bg-(--color-accent-muted) border border-(--color-accent-border) text-(--color-accent)"
                        : "bg-(--color-surface-3) border border-(--color-border) text-(--color-text-muted)",
                    ),
                    "mt-0.5 shrink-0",
                  )}>
                  <DeviceIcon ua={s.userAgent} />
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-(--color-text-primary)">
                      {browser} on {os}
                    </span>
                    {s.isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-(--color-accent-muted) text-(--color-accent) border border-(--color-accent-border)">
                        <span className="w-1.5 h-1.5 rounded-full bg-(--color-accent) animate-pulse" />
                        this device
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1">
                    {displayIp && (
                      <span className="text-xs font-mono text-(--color-text-muted)">
                        {displayIp}
                      </span>
                    )}
                    {location && (
                      <span className="text-xs text-(--color-text-muted)">{location}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-(--color-text-muted) mt-0.5">
                    Signed in {relativeTime(s.createdAt)}
                  </p>
                </div>
              </div>

              {!s.isCurrent && (
                <div className="shrink-0 flex items-center gap-2 mt-0.5">
                  {isConfirming ? (
                    <>
                      <span className="text-xs text-(--color-text-muted)">Revoke?</span>
                      <button
                        onClick={() => setConfirming(null)}
                        className="text-xs text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors cursor-pointer">
                        Cancel
                      </button>
                      <button
                        onClick={() => revoke(s.id)}
                        disabled={revoking === s.id}
                        className="text-xs font-medium text-(--color-danger) hover:underline disabled:opacity-50 cursor-pointer">
                        {revoking === s.id ? "…" : "Yes, revoke"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirming(s.id)}
                      className="text-xs text-(--color-text-muted) hover:text-(--color-danger) transition-colors duration-150 cursor-pointer">
                      Revoke
                    </button>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {otherCount > 1 && (
        <button
          onClick={revokeAll}
          className="self-start text-xs text-(--color-text-muted) hover:text-(--color-danger) transition-colors duration-150 cursor-pointer">
          Sign out all other sessions ({otherCount})
        </button>
      )}
    </div>
  )
}
