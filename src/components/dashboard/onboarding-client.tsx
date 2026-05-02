"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, ScanLine, Layers, CheckCircle, Loader, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cardSection, cn } from "@/lib/cn"
import { fadeUp, stagger } from "@/lib/motion"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Step = "connect" | "scan" | "done"

type Props = {
  userName:       string | null
  hasGmailAccess: boolean
  scanStatus:     string
}

const STEPS = [
  { id: "connect", icon: Mail,     label: "Connect Gmail"  },
  { id: "scan",    icon: ScanLine, label: "Scan inbox"     },
  { id: "done",    icon: Layers,   label: "Set up digest"  },
] as const

export default function OnboardingClient({
  userName,
  hasGmailAccess: initialGmail,
  scanStatus:     initialScan,
}: Props) {
  const getInitialStep = (): Step => {
    if (!initialGmail)              return "connect"
    if (initialScan !== "done")     return "scan"
    return "done"
  }

  const [step, setStep]             = useState<Step>(getInitialStep)
  const [scanStatus, setScanStatus] = useState(initialScan)
  const [senderCount, setSenderCount] = useState(0)
  const [pending, startTransition]  = useTransition()
  const eventSourceRef              = useRef<EventSource | null>(null)
  const router                      = useRouter()

  const greeting = userName
    ? `Welcome, ${userName.split(" ")[0]}`
    : "Welcome to Vanta"

  const connectSSE = () => {
    const es = new EventSource("/api/sse/scan")
    eventSourceRef.current = es

    es.addEventListener("status", (e) => {
      const data = JSON.parse(e.data)
      setScanStatus(data.scanStatus)
      setSenderCount(data.senderCount ?? 0)
    })

    es.addEventListener("complete", (e) => {
      const data = JSON.parse(e.data)
      setScanStatus(data.scanStatus)
      setSenderCount(data.senderCount ?? 0)
      es.close()
      if (data.scanStatus === "done") {
        setTimeout(() => setStep("done"), 800)
      }
    })

    es.addEventListener("error", () => es.close())
  }

  useEffect(() => {
    if (initialScan === "scanning") connectSSE()
    return () => eventSourceRef.current?.close()
  }, [])

  const triggerScan = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/scan", { method: "POST" })
        if (res.ok) {
          setScanStatus("scanning")
          connectSSE()
        }
      } catch {}
    })
  }

  const currentStepIndex = STEPS.findIndex(s => s.id === step)

  return (
    <div className="w-full max-w-lg">

      {/* Header */}
      <motion.div
        variants={fadeUp()}
        initial="hidden"
        animate="show"
        className="text-center mb-10"
      >
        <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-accent) text-white text-sm font-bold font-display transition-all duration-200 group-hover:scale-110"
          >
            V
          </span>
          <span className="font-display font-bold text-xl tracking-tight text-(--color-text-primary)">
            Vanta
          </span>
        </Link>

        <h1 className="font-display font-black text-3xl text-(--color-text-primary) tracking-tight">
          {greeting}
        </h1>
        <p className="text-sm text-(--color-text-muted) mt-2">
          Three quick steps to inbox zero.
        </p>
      </motion.div>

      {/* Step indicators */}
      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        animate="show"
        className="flex items-center justify-center gap-2 mb-10"
        role="list"
        aria-label="Onboarding steps"
      >
        {STEPS.map(({ id, label }, i) => {
          const isCompleted = i < currentStepIndex
          const isCurrent   = i === currentStepIndex

          return (
            <motion.div
              key={id}
              variants={fadeUp(0)}
              role="listitem"
              aria-current={isCurrent ? "step" : undefined}
              className="flex items-center gap-2"
            >
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-300",
                isCompleted && "text-(--color-success)",
                isCurrent   && "bg-(--color-accent-muted) text-(--color-accent) border border-(--color-accent-border)",
                !isCompleted && !isCurrent && "text-(--color-text-muted)"
              )}>
                {isCompleted
                  ? <CheckCircle size={12} aria-hidden="true" />
                  : <span aria-hidden="true" className="w-3 h-3 rounded-full border border-current" />
                }
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "w-6 h-px transition-colors duration-300",
                  i < currentStepIndex
                    ? "bg-(--color-success)"
                    : "bg-(--color-border)"
                )} aria-hidden="true" />
              )}
            </motion.div>
          )
        })}
      </motion.div>

      {/* Step content */}
      <AnimatePresence mode="wait">

        {/* Step 1 — Connect Gmail */}
        {step === "connect" && (
          <motion.div
            key="connect"
            variants={fadeUp()}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -12 }}
            className={cn(cardSection," rounded-2xl p-8 flex flex-col items-center text-center gap-6")}
          >
            <span
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-(--color-accent-muted) border border-(--color-accent-border)"
            >
              <Mail size={28} className="text-(--color-accent)" />
            </span>

            <div>
              <h2 className="font-display font-bold text-xl text-(--color-text-primary) tracking-tight">
                Connect your Gmail
              </h2>
              <p className="text-sm text-(--color-text-muted) mt-2 leading-relaxed max-w-sm">
                Vanta needs read access to scan your inbox and detect what's cluttering it. We never store email content.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button size="lg" className="w-full shadow-(--shadow-glow-sm)">
                <Link href="/api/auth/google/gmail">
                  <Mail size={16} aria-hidden="true" />
                  Connect Gmail
                </Link>
              </Button>
              <p className="text-xs text-(--color-text-muted) font-mono">
                Read-only · No content stored · Revoke anytime
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2 — Scan */}
        {step === "scan" && (
          <motion.div
            key="scan"
            variants={fadeUp()}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -12 }}
            className={cn(cardSection," rounded-2xl p-8 flex flex-col items-center text-center gap-6")}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
                scanStatus === "scanning"
                  ? "bg-(--color-accent-muted) border border-(--color-accent-border)"
                  : "bg-(--color-surface-2) border border-(--color-border)"
              )}
            >
              {scanStatus === "scanning"
                ? <Loader size={28} className="text-(--color-accent) animate-spin" />
                : <ScanLine size={28} className="text-(--color-text-muted)" />
              }
            </span>

            <div>
              <h2 className="font-display font-bold text-xl text-(--color-text-primary) tracking-tight">
                {scanStatus === "scanning" ? "Scanning your inbox…" : "Scan your inbox"}
              </h2>
              <p className="text-sm text-(--color-text-muted) mt-2 leading-relaxed">
                {scanStatus === "scanning"
                  ? senderCount > 0
                    ? `Found ${senderCount.toLocaleString()} senders so far. This takes up to 60 seconds.`
                    : "Analysing 90 days of email headers…"
                  : "We'll scan the last 90 days and group every sender by type."
                }
              </p>
            </div>

            {/* Live progress bar */}
            {scanStatus === "scanning" && (
              <div
                role="progressbar"
                aria-label="Scan in progress"
                aria-valuetext="Scanning"
                className="w-full h-1 bg-(--color-surface-3) rounded-full overflow-hidden"
              >
                <motion.div
                  className="h-full bg-(--color-accent) rounded-full"
                  initial={{ width: "5%" }}
                  animate={{ width: "90%" }}
                  transition={{ duration: 55, ease: "linear" }}
                />
              </div>
            )}

            {(scanStatus === "idle" || scanStatus === "failed") && (
              <Button
                size="lg"
                className="w-full shadow-(--shadow-glow-sm)"
                onClick={triggerScan}
                disabled={pending}
              >
                {pending
                  ? <Loader size={16} className="animate-spin" aria-hidden="true" />
                  : <ScanLine size={16} aria-hidden="true" />
                }
                {pending ? "Starting…" : "Scan my inbox"}
              </Button>
            )}
          </motion.div>
        )}

        {/* Step 3 — Done */}
        {step === "done" && (
          <motion.div
            key="done"
            variants={fadeUp()}
            initial="hidden"
            animate="show"
            className={cn(cardSection," rounded-2xl p-8 flex flex-col items-center text-center gap-6")}
          >
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-(--color-success-muted) border border-(--color-success)/20"
            >
              <CheckCircle size={28} className="text-(--color-success)" />
            </motion.span>

            <div>
              <h2 className="font-display font-bold text-xl text-(--color-text-primary) tracking-tight">
                Inbox scanned
              </h2>
              <p className="text-sm text-(--color-text-muted) mt-2 leading-relaxed">
                Found{" "}
                <span className="font-bold text-(--color-text-primary)">
                  {senderCount.toLocaleString()}
                </span>{" "}
                senders. Now let's clean things up.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button  size="lg" className="w-full shadow-(--shadow-glow-sm)">
                <Link href="/dashboard/senders">
                  Manage senders
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Button>
              <Button  variant="outline" size="lg" className="w-full">
                <Link href="/dashboard">
                  Go to dashboard
                </Link>
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}