"use client"

import { useState, useMemo, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Layers, Search, Loader, CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  cn, cardSection, iconSquare,
  pillAccent, pillDanger, pillNeutral, pillSuccess,
  tableHeaderCell, tableRow, tableCell,
} from "@/lib/cn"
import { stagger, fadeUp } from "@/lib/motion"
import type { Sender } from "@backend/db/schema"
import EmptyState from "./empty-state"
import Link from "next/link"

type Props = { initialSenders: Sender[] }

const CATEGORIES = ["all", "newsletter", "promo", "social", "transactional", "cold", "other"] as const

const CATEGORY_PILL: Record<string, string> = {
  newsletter:    pillAccent,
  promo:         "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border bg-(--color-warning-muted) text-(--color-warning) border-amber-700/20",
  social:        pillNeutral,
  transactional: pillSuccess,
  cold:          pillDanger,
  other:         pillNeutral,
}

export default function SendersClient({ initialSenders }: Props) {
  const [senderList, setSenderList]     = useState(initialSenders)
  const [selected, setSelected]         = useState<Set<string>>(new Set())
  const [search, setSearch]             = useState("")
  const [category, setCategory]         = useState<string>("all")
  const [pending, startTransition]      = useTransition()
  const [success, setSuccess]           = useState(false)
  const [digestSuccess, setDigestSuccess] = useState(false)

  const filtered = useMemo(() =>
    senderList.filter(s => {
      if (category !== "all" && s.category !== category) return false
      if (search &&
        !s.email.toLowerCase().includes(search.toLowerCase()) &&
        !s.displayName?.toLowerCase().includes(search.toLowerCase())
      ) return false
      return true
    }),
    [senderList, category, search]
  )

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(
      selected.size === filtered.length
        ? new Set()
        : new Set(filtered.map(s => s.id))
    )
  }

  const unsubscribeSelected = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/senders/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderIds: Array.from(selected) }),
        })
        if (res.ok) {
          setSenderList(prev => prev.map(s => selected.has(s.id) ? { ...s, status: "unsubscribed" } : s))
          setSelected(new Set())
          setSuccess(true)
          setTimeout(() => setSuccess(false), 3000)
        }
      } catch {}
    })
  }

  const addToDigest = () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/digest/senders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderIds: Array.from(selected) }),
        })
        if (res.ok) {
          setSenderList(prev => prev.map(s => selected.has(s.id) ? { ...s, status: "in_digest" } : s))
          setSelected(new Set())
          setDigestSuccess(true)
          setTimeout(() => setDigestSuccess(false), 3000)
        }
      } catch {}
    })
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Banners */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            role="status"
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-(--color-success-muted) border border-[rgba(34,197,94,0.2)] text-sm text-(--color-success)"
          >
            <CheckCircle size={14} aria-hidden="true" />
            Unsubscribe jobs queued.
          </motion.div>
        )}
        {digestSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            role="status"
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-(--color-accent-muted) border border-(--color-accent-border) text-sm text-(--color-accent)"
          >
            <Layers size={14} aria-hidden="true" />
            Added to digest.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-muted)" aria-hidden="true" />
          <Input
            placeholder="Search senders…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
            aria-label="Search senders"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all duration-120 border",
                category === cat
                  ? "bg-(--color-accent-muted) text-(--color-accent) border-(--color-accent-border)"
                  : "text-(--color-text-muted) border-(--color-border) hover:text-(--color-text-secondary) hover:bg-white/4"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={cn(cardSection, "flex items-center justify-between px-4 py-2.5")}
          >
            <span className="text-[13px] text-(--color-text-muted)">
              <span className="font-semibold text-(--color-text-primary)">{selected.size}</span> selected
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={addToDigest} disabled={pending} className="gap-1.5 h-7 text-xs">
                {pending ? <Loader size={12} className="animate-spin" /> : <Layers size={12} />}
                Add to digest
              </Button>
              <Button size="sm" onClick={unsubscribeSelected} disabled={pending} className="gap-1.5 h-7 text-xs">
                {pending ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}
                Unsubscribe {selected.size}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {filtered.length === 0 && (
        <EmptyState
          icon={Mail}
          title={senderList.length === 0 ? "No senders yet" : "No matches"}
          description={
            senderList.length === 0
              ? "Scan your inbox to detect senders. It takes under 60 seconds."
              : "No senders match your filters."
          }
          action={senderList.length === 0
            ? <Button size="sm"><Link href="/dashboard">Go to overview</Link></Button>
            : undefined
          }
        />
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className={cn(cardSection, "overflow-hidden")}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-(--color-border)">
                <th className={cn(tableHeaderCell, "w-10")}>
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    aria-label="Select all"
                    className="h-3.5 w-3.5 rounded accent-orange-500"
                  />
                </th>
                <th className={tableHeaderCell}>Sender</th>
                <th className={cn(tableHeaderCell, "hidden sm:table-cell text-right")}>Emails</th>
                <th className={cn(tableHeaderCell, "hidden md:table-cell")}>Category</th>
                <th className={cn(tableHeaderCell, "text-right")}>Status</th>
                <th className={cn(tableHeaderCell, "w-8")} />
              </tr>
            </thead>

            <motion.tbody
              variants={stagger(0.03)}
              initial="hidden"
              animate="show"
            >
              {filtered.map(sender => (
                <motion.tr
                  key={sender.id}
                  variants={fadeUp(0)}
                  className={cn(
                    tableRow,
                    selected.has(sender.id) && "bg-(--color-accent-muted)",
                    sender.status === "unsubscribed" && "opacity-40"
                  )}
                >
                  {/* Checkbox */}
                  <td className={cn(tableCell, "w-10")}>
                    <input
                      type="checkbox"
                      checked={selected.has(sender.id)}
                      onChange={() => toggleSelect(sender.id)}
                      disabled={sender.status === "unsubscribed"}
                      aria-label={`Select ${sender.displayName ?? sender.email}`}
                      className="h-3.5 w-3.5 rounded accent-orange-500"
                    />
                  </td>

                  {/* Sender name + email */}
                  <td className={tableCell}>
                    <div className="flex items-center gap-3">
                      {/* Avatar icon square */}
                      <span className={iconSquare("bg-(--color-surface-3) border border-(--color-border) text-(--color-text-muted) font-bold font-display text-xs")}>
                        {(sender.displayName ?? sender.email)[0].toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-(--color-text-primary) truncate leading-tight">
                          {sender.displayName ?? sender.email}
                        </p>
                        <p className="text-[11px] text-(--color-text-muted) truncate font-mono">
                          {sender.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email count */}
                  <td className={cn(tableCell, "hidden sm:table-cell text-right font-mono text-[12px]")}>
                    {sender.emailCount.toLocaleString()}
                  </td>

                  {/* Category */}
                  <td className={cn(tableCell, "hidden md:table-cell")}>
                    <span className={CATEGORY_PILL[sender.category] ?? pillNeutral}>
                      {sender.category}
                    </span>
                  </td>

                  {/* Status */}
                  <td className={cn(tableCell, "text-right")}>
                    {sender.status === "unsubscribed" && <span className={pillDanger}>unsub</span>}
                    {sender.status === "in_digest"    && <span className={pillSuccess}>digest</span>}
                    {sender.status === "active"       && <span className={pillNeutral}>active</span>}
                  </td>

                  {/* Actions placeholder */}
                  <td className={cn(tableCell, "w-8")} />
                </motion.tr>
              ))}
            </motion.tbody>
          </table>

          {/* Pagination footer */}
          <div className="px-4 py-2.5 border-t border-(--color-border) flex items-center justify-between">
            <p className="text-[11px] font-mono text-(--color-text-muted)">
              {filtered.length} of {senderList.length} senders
            </p>
          </div>
        </div>
      )}
    </div>
  )
}