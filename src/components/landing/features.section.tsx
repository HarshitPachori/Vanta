"use client"

import { cardSection, cn } from "@/lib/cn"
import { fadeUp, stagger } from "@/lib/motion"
import { motion } from "framer-motion"
import { BarChart2, Clock, Layers, MailX, ShieldCheck, Zap } from "lucide-react"

const FEATURES = [
  {
    icon: Zap,
    num: "01",
    title: "Instant inbox scan",
    description: "Connect Gmail once. We scan 90 days of email in under 60 seconds and group every sender by type.",
  },
  {
    icon: MailX,
    num: "02",
    title: "One-click unsubscribe",
    description: "Bulk unsubscribe from hundreds of senders. We use RFC List-Unsubscribe headers — never sketchy link clicking.",
  },
  {
    icon: Layers,
    num: "03",
    title: "Daily digest",
    description: "Pick the newsletters you love. Bundled into one clean email at a time you choose. Originals auto-archived.",
  },
  {
    icon: Clock,
    num: "04",
    title: "Set and forget",
    description: "Configure once. Vanta runs silently in the background. No daily action needed. Just a cleaner inbox.",
  },
  {
    icon: ShieldCheck,
    num: "05",
    title: "Privacy first",
    description: "Email headers only — never your content. OAuth scoped to the minimum required. Zero data sold.",
  },
  {
    icon: BarChart2,
    num: "06",
    title: "Inbox health score",
    description: "Weekly score showing emails blocked, digested, and how your inbox trends over time.",
  },
] as const

export default function FeaturesSection() {
  return (
    <section id="features" aria-labelledby="features-heading" className="py-24 px-5">
      <div className="mx-auto max-w-6xl">

        <header className="mb-16">
          <p className="text-xs font-mono text-(--color-accent) uppercase tracking-[0.12em] mb-3">
            Features
          </p>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl font-display font-bold text-(--color-text-primary) tracking-tight max-w-lg"
          >
            Everything your inbox needs
          </h2>
        </header>

        <motion.ul
          role="list"
          variants={stagger(0.07)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-(--color-border) rounded-2xl overflow-hidden border border-(--color-border)"
        >
          {FEATURES.map(({ icon: Icon, num, title, description }) => (
            <motion.li
              key={title}
              variants={fadeUp(0)}
            >
              <article
                className={cn(
                  "relative h-full p-6 bg-(--color-surface)",
                  "hover:bg-(--color-surface-2) transition-colors duration-200 group overflow-hidden"
                )}
              >
                {/* Watermark number */}
                <span
                  aria-hidden="true"
                  className="absolute top-4 right-4 font-display font-black text-6xl leading-none text-(--color-surface-3) group-hover:text-(--color-surface-2) transition-colors duration-200 select-none pointer-events-none"
                >
                  {num}
                </span>

                {/* Icon */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg mb-5",
                    "bg-(--color-accent-muted) text-(--color-accent) border border-(--color-accent-border)",
                    "group-hover:bg-(--color-accent) group-hover:text-white group-hover:border-transparent",
                    "transition-all duration-200"
                  )}
                >
                  <Icon size={16} />
                </span>

                <h3 className="font-display font-bold text-sm text-(--color-text-primary) mb-2 tracking-tight">
                  {title}
                </h3>
                <p className="text-sm text-(--color-text-muted) leading-relaxed">
                  {description}
                </p>
              </article>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}