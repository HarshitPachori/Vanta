"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, Trash2, Mail } from "lucide-react";
import { cardSection, cn, skeleton } from "@/lib/cn";
import { EASE_SMOOTH, EASE_OUT } from "@/lib/motion";

const EMAILS = [
  {
    id: 1,
    from: "Morning Brew",
    subject: "Markets opened lower today",
    tag: "newsletter",
    keep: true,
  },
  {
    id: 2,
    from: "Nike Promotions",
    subject: "Up to 50% off — today only",
    tag: "promo",
    keep: false,
  },
  {
    id: 3,
    from: "Substack Weekly",
    subject: "Your weekly reading list",
    tag: "newsletter",
    keep: true,
  },
  {
    id: 4,
    from: "LinkedIn",
    subject: "You have 14 new notifications",
    tag: "social",
    keep: false,
  },
  {
    id: 5,
    from: "Medium Digest",
    subject: "Top stories for you today",
    tag: "newsletter",
    keep: true,
  },
  {
    id: 6,
    from: "Amazon",
    subject: "Your order has shipped",
    tag: "promo",
    keep: false,
  },
] as const;

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> =
  {
    newsletter: {
      bg: "bg-(--color-accent-muted)",
      text: "text-(--color-accent)",
      border: "border-(--color-accent-border)",
    },
    promo: {
      bg: "bg-(--color-warning-muted)",
      text: "text-(--color-warning)",
      border: "border-amber-700/20",
    },
    social: {
      bg: "bg-(--color-surface-3)",
      text: "text-(--color-text-muted)",
      border: "border-(--color-border)",
    },
  };

const STATS = [
  { label: "Scanned", value: "1,842" },
  { label: "Unsubscribed", value: "94" },
  { label: "In digest", value: "3" },
];

export default function HeroAnimation() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= EMAILS.length) return;
    const t = setTimeout(
      () => setVisibleCount((v) => v + 1),
      350 + visibleCount * 120,
    );
    return () => clearTimeout(t);
  }, [visibleCount]);

  return (
    <figure
      aria-label="Inbox cleaner demo — emails being sorted into digest or unsubscribed"
      className={cn(
        cardSection,
        "border-(--color-accent-border) shadow-(--shadow-glow) overflow-hidden rounded-2xl",
      )}>
      {/* Window chrome */}
      <header className="flex items-center gap-2 px-4 py-3 border-b border-(--color-border) bg-(--color-surface-2)">
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 rounded-full bg-red-500/60"
        />
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 rounded-full bg-amber-500/60"
        />
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 rounded-full bg-green-500/60"
        />
        <span className="ml-3 text-xs text-(--color-text-muted) font-mono tracking-wide">
          vanta — inbox scan
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-(--color-accent) animate-pulse"
            aria-hidden="true"
          />
          <span className="text-xs font-mono text-(--color-accent)">
            scanning
          </span>
        </span>
      </header>

      {/* Stats bar */}
      <div
        role="status"
        aria-live="polite"
        className="grid grid-cols-3 divide-x divide-(--color-border) border-b border-(--color-border) bg-(--color-surface-2)/50">
        {STATS.map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center py-3 px-4">
            <span className="text-lg font-bold font-display text-(--color-text-primary) tracking-tight">
              {value}
            </span>
            <span className="text-xs text-(--color-text-muted) mt-0.5">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Email rows */}
      <ul aria-label="Email list being processed" className="min-h-72">
        <AnimatePresence initial={false}>
          {EMAILS.slice(0, visibleCount).map((email, i) => (
            <motion.li
              key={email.id}
              initial={{ opacity: 0, x: -16, height: 0 }}
              animate={{ opacity: email.keep ? 1 : 0.4, x: 0, height: "auto" }}
              transition={{ duration: 0.38, ease: EASE_OUT, delay: 0 }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 border-b border-(--color-border) last:border-b-0",
                "hover:bg-(--color-surface-2) transition-colors duration-150",
              )}>
              {/* Avatar dot */}
              <span
                aria-hidden="true"
                className={cn(
                  "shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold font-display",
                  email.keep
                    ? "bg-(--color-accent-muted) text-(--color-accent)"
                    : "bg-(--color-surface-3) text-(--color-text-muted)",
                )}>
                {email.from[0]}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-(--color-text-primary) truncate leading-tight">
                  {email.from}
                </p>
                <p className="text-xs text-(--color-text-muted) truncate mt-0.5">
                  {email.subject}
                </p>
              </div>

              {/* Tag */}
              <span
                className={cn(
                  "hidden sm:inline-flex shrink-0 items-center px-2 py-0.5 rounded-md text-xs border font-mono",
                  TAG_COLORS[email.tag].bg,
                  TAG_COLORS[email.tag].text,
                  TAG_COLORS[email.tag].border,
                )}>
                {email.tag}
              </span>

              {/* Action */}
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.25, ease: EASE_SMOOTH }}
                aria-label={email.keep ? "kept in digest" : "unsubscribed"}
                className={cn(
                  "shrink-0 flex items-center gap-1 text-xs font-medium font-mono",
                  email.keep
                    ? "text-(--color-success)"
                    : "text-(--color-danger)",
                )}>
                {email.keep ? (
                  <Inbox size={12} aria-hidden="true" />
                ) : (
                  <Trash2 size={12} aria-hidden="true" />
                )}
                {email.keep ? "digest" : "unsub"}
              </motion.span>
            </motion.li>
          ))}
        </AnimatePresence>

        {/* Loading skeleton rows */}
        {visibleCount < EMAILS.length &&
          Array.from({ length: Math.min(2, EMAILS.length - visibleCount) }).map(
            (_, i) => (
              <li
                key={`skeleton-${i}`}
                className={cn(
                  skeleton,
                  "flex items-center gap-3 px-4 py-3 border-b border-(--color-border) last:border-b-0",
                )}>
                <div className="h-7 w-7 rounded-lg bg-(--color-surface-3) animate-pulse shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="h-3 w-28 rounded bg-(--color-surface-3) animate-pulse" />
                  <div className="h-2.5 w-44 rounded bg-(--color-surface-3) animate-pulse" />
                </div>
                <div className="h-4 w-16 rounded bg-(--color-surface-3) animate-pulse hidden sm:block" />
                <div className="h-4 w-12 rounded bg-(--color-surface-3) animate-pulse" />
              </li>
            ),
          )}
      </ul>

      {/* Footer bar */}
      <footer className="flex items-center justify-between px-4 py-2.5 border-t border-(--color-border) bg-(--color-surface-2)/50">
        <div className="flex items-center gap-1.5">
          <Mail
            size={11}
            className="text-(--color-text-muted)"
            aria-hidden="true"
          />
          <span className="text-xs font-mono text-(--color-text-muted)">
            {visibleCount} of {EMAILS.length} processed
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-(--color-danger)">
            3 unsubscribed
          </span>
          <span className="text-xs font-mono text-(--color-success)">
            3 in digest
          </span>
        </div>
      </footer>
    </figure>
  );
}
