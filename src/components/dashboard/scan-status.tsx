"use client"

import { useEffect, useState, useTransition, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cardSection, cn, iconSquare } from "@/lib/cn"
import { fadeUp } from "@/lib/motion"
import { useRouter } from "next/navigation"

type Props = {
  scanStatus:    string
  lastScannedAt: number | null
}

export default function ScanStatus({ scanStatus: initial, lastScannedAt: initialTs }: Props) {
  const [status, setStatus]         = useState(initial)
  const [lastScannedAt, setLastTs]  = useState(initialTs)
  const [senderCount, setSenderCount] = useState<number | null>(null)
  const [pending, startTransition]  = useTransition()
  const eventSourceRef              = useRef<EventSource | null>(null)
  const router                      = useRouter()

  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const es = new EventSource("/api/sse/scan")
    eventSourceRef.current = es

    es.addEventListener("status", (e) => {
      const data = JSON.parse(e.data)
      setStatus(data.scanStatus)
      setLastTs(data.lastScannedAt)
      setSenderCount(data.senderCount)
    })

    es.addEventListener("complete", (e) => {
      const data = JSON.parse(e.data)
      setStatus(data.scanStatus)
      setLastTs(data.lastScannedAt)
      setSenderCount(data.senderCount)
      es.close()
      eventSourceRef.current = null
      // revalidate page data
      setTimeout(() => router.refresh(), 500)
    })

    es.addEventListener("timeout", () => {
      es.close()
      eventSourceRef.current = null
    })

    es.addEventListener("error", () => {
      es.close()
      eventSourceRef.current = null
    })
  }

  // connect SSE if scan is already running on mount
  useEffect(() => {
    if (initial === "scanning") connectSSE()
    return () => {
      eventSourceRef.current?.close()
    }
  }, [])

  const triggerScan = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/scan", { method: "POST" })
        if (res.ok) {
          setStatus("scanning")
          connectSSE()
        }
      } catch {}
    })
  }

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key={status}
        variants={fadeUp()}
        initial="hidden"
        animate="show"
        aria-labelledby="scan-status-heading"
        className={cn(
          cardSection,
          " rounded-xl p-5 flex items-center gap-4",
          status === "scanning" && "border-(--color-accent-border)"
        )}
      >
        {/* Icon */}
        <span
          aria-hidden="true"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
            status === "scanning" && iconSquare("bg-(--color-accent-muted) border border-(--color-accent-border)"),
            status === "done"     && iconSquare("bg-(--color-success-muted) border border-(--color-success)/20"),
            status === "failed"   && iconSquare("bg-(--color-danger-muted) border border-(--color-danger)/20"),
            (status === "idle" || status === "token_expired") && "bg-(--color-surface-2) border border-(--color-border)",
          )}
        >
          {status === "scanning" && <Loader size={18} className="text-(--color-accent) animate-spin" />}
          {status === "done"     && <CheckCircle size={18} className="text-(--color-success)" />}
          {status === "failed"   && <AlertCircle size={18} className="text-(--color-danger)" />}
          {(status === "idle" || status === "token_expired") && <RefreshCw size={18} className="text-(--color-text-muted)" />}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h2
            id="scan-status-heading"
            className="font-display font-bold text-sm text-(--color-text-primary) tracking-tight"
          >
            {status === "scanning"      && "Scanning your inbox…"}
            {status === "done"          && "Inbox scanned"}
            {status === "idle"          && "Ready to scan"}
            {status === "failed"        && "Scan failed"}
            {status === "token_expired" && "Gmail access expired"}
          </h2>
          <p className="text-xs text-(--color-text-muted) mt-0.5">
            {status === "scanning" && (
              senderCount !== null
                ? `${senderCount.toLocaleString()} senders found so far…`
                : "Analysing 90 days of headers. Up to 60 seconds."
            )}
            {status === "done" && (
              senderCount !== null
                ? `Found ${senderCount.toLocaleString()} senders. Last scanned ${lastScannedAt ? new Date(lastScannedAt * 1000).toLocaleDateString() : "recently"}.`
                : `Last scanned ${lastScannedAt ? new Date(lastScannedAt * 1000).toLocaleDateString() : "recently"}.`
            )}
            {status === "idle"          && "Scan 90 days of inbox to detect senders."}
            {status === "failed"        && "Something went wrong. Try again."}
            {status === "token_expired" && "Your Gmail token expired. Reconnect to continue."}
          </p>
        </div>

        {/* Action */}
        {status === "scanning" && (
          <span className="text-xs font-mono text-(--color-accent) animate-pulse shrink-0">
            Live
          </span>
        )}
        {(status === "idle" || status === "failed") && (
          <Button
            size="sm"
            onClick={triggerScan}
            disabled={pending}
            className="shrink-0"
          >
            {pending ? <Loader size={13} className="animate-spin" /> : "Scan now"}
          </Button>
        )}
        {status === "done" && (
          <Button
            size="sm"
            variant="outline"
            onClick={triggerScan}
            disabled={pending}
            className="shrink-0 gap-1.5"
          >
            {pending
              ? <Loader size={13} className="animate-spin" />
              : <RefreshCw size={13} />
            }
            Rescan
          </Button>
        )}
        {status === "token_expired" && (
          <Button variant="outline" size="sm" className="shrink-0">
            <a href="/api/auth/google/gmail">Reconnect</a>
          </Button>
        )}
      </motion.section>
    </AnimatePresence>
  )
}