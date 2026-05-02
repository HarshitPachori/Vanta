"use client";

import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cardSection, cn } from "@/lib/cn";
import { fadeUp } from "@/lib/motion";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get a feel for a quieter inbox.",
    cta: "Get started",
    href: "/signup",
    highlight: false,
    features: [
      "25 unsubscribes per month",
      "Inbox scan — last 90 days",
      "Sender categorisation",
      "Gmail OAuth — secure",
    ],
  },
  {
    name: "Pro",
    price: "$6",
    period: "per month",
    description: "Unlimited quiet. One clean digest daily.",
    cta: "Start free trial",
    href: "/signup?plan=pro",
    highlight: true,
    features: [
      "Unlimited unsubscribes",
      "Daily digest — unlimited senders",
      "Inbox health score",
      "Weekly stats email",
      "Priority support",
    ],
    note: "One recovered subscription pays for 6 months",
  },
] as const;

export default function PricingSection() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="py-24 px-5 border-t border-(--color-border)">
      <div className="mx-auto max-w-4xl">
        <header className="mb-16">
          <p className="text-xs font-mono text-(--color-accent) uppercase tracking-[0.12em] mb-3">
            Pricing
          </p>
          <h2
            id="pricing-heading"
            className="text-3xl sm:text-4xl font-display font-bold text-(--color-text-primary) tracking-tight">
            Simple, honest pricing
          </h2>
          <p className="mt-3 text-sm text-(--color-text-muted)">
            Start free. Upgrade when your inbox thanks you.
          </p>
        </header>

        <div
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          {PLANS.map((plan, i) => (
            <motion.article
              key={plan.name}
              role="listitem"
              variants={fadeUp(i * 0.1)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className={cn(
                cardSection,
                "flex flex-col gap-5 rounded-2xl p-7",
                plan.highlight &&
                  "border-(--color-accent-border) shadow-(--shadow-glow) scale-[1.02] origin-bottom",
              )}>
              <header>
                {plan.highlight && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="pulse-dot relative flex h-2 w-2">
                      <span className="h-2 w-2 rounded-full bg-(--color-accent)" />
                    </span>
                    <span className="text-xs font-mono text-(--color-accent) uppercase tracking-wider">
                      Most popular
                    </span>
                  </div>
                )}
                <h3 className="font-display font-bold text-(--color-text-primary) tracking-tight">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-display font-black text-4xl text-(--color-text-primary) tracking-tighter leading-none">
                    {plan.price}
                  </span>
                  <span className="text-sm text-(--color-text-muted)">
                    / {plan.period}
                  </span>
                </div>
                <p className="mt-2 text-sm text-(--color-text-muted)">
                  {plan.description}
                </p>
              </header>

              <Button
                variant={plan.highlight ? "default" : "outline"}
                className={cn(
                  "w-full",
                  plan.highlight && "shadow-(--shadow-glow-sm)",
                )}>
                <Link href={plan.href}>
                  {plan.highlight && <Zap size={14} aria-hidden="true" />}
                  {plan.cta}
                </Link>
              </Button>

              <ul
                aria-label={`${plan.name} plan features`}
                className="flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check
                      aria-hidden="true"
                      size={14}
                      className="mt-0.5 shrink-0 text-(--color-success)"
                    />
                    <span className="text-(--color-text-secondary)">{f}</span>
                  </li>
                ))}
              </ul>

              {"note" in plan && (
                <p className="text-xs font-mono text-(--color-text-muted) border-t border-(--color-border) pt-4">
                  {plan.note}
                </p>
              )}
            </motion.article>
          ))}
        </div>

        <p className="text-center text-xs text-(--color-text-muted) mt-8 font-mono">
          14-day free trial on Pro · No credit card required
        </p>
      </div>
    </section>
  );
}
