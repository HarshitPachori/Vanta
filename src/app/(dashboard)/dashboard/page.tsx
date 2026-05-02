import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyToken } from "@backend/lib/jwt";
import { getDb } from "@backend/lib/db";
import { users, sessions, senders } from "@backend/db/schema";
import { eq, and, gt, count, sql } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Trash2,
  Layers,
  BarChart2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import ScanStatus from "@/components/dashboard/scan-status";
import { requireOnboarding } from "@/lib/auth";
import { cardSection, metricCard, cn, iconSquare } from "@/lib/cn";

export const metadata: Metadata = { title: "Overview — Vanta" };

const getData = async () => {
  try {
    const { env } = getCloudflareContext();
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    const payload = await verifyToken<{ sessionId: string }>(
      token,
      env.AUTH_JWT_SECRET,
    );
    if (!payload?.sessionId) return null;

    const db = getDb(env.DB);
    const now = Math.floor(Date.now() / 1000);

    const session = await db
      .select()
      .from(sessions)
      .where(
        and(eq(sessions.id, payload.sessionId), gt(sessions.expiresAt, now)),
      )
      .get();

    if (!session) return null;

    const user = await db
      .select({
        id: users.id,
        hasGmailAccess: users.hasGmailAccess,
        scanStatus: users.scanStatus,
        lastScannedAt: users.lastScannedAt,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .get();

    if (!user) return null;

    const [totalRow] = await db
      .select({ count: count() })
      .from(senders)
      .where(eq(senders.userId, user.id));

    const [unsubRow] = await db
      .select({ count: count() })
      .from(senders)
      .where(
        and(eq(senders.userId, user.id), eq(senders.status, "unsubscribed")),
      );

    const [digestRow] = await db
      .select({ count: count() })
      .from(senders)
      .where(and(eq(senders.userId, user.id), eq(senders.status, "in_digest")));

    const [newsletterRow] = await db
      .select({ count: count() })
      .from(senders)
      .where(
        and(eq(senders.userId, user.id), eq(senders.category, "newsletter")),
      );

    return {
      user,
      stats: {
        total: totalRow?.count ?? 0,
        unsubscribed: unsubRow?.count ?? 0,
        inDigest: digestRow?.count ?? 0,
        newsletters: newsletterRow?.count ?? 0,
      },
    };
  } catch {
    return null;
  }
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ gmail?: string }>;
}) {
  await requireOnboarding();
  const data = await getData();
  if (!data) redirect("/login");

  const { user, stats } = data;
  const { gmail } = await searchParams;
  const gmailJustConnected = gmail === "connected";

  const STATS = [
    {
      label: "Senders found",
      value: stats.total,
      icon: BarChart2,
      color: "text-(--color-text-primary)",
    },
    {
      label: "Unsubscribed",
      value: stats.unsubscribed,
      icon: Trash2,
      color: "text-(--color-danger)",
    },
    {
      label: "In digest",
      value: stats.inDigest,
      icon: Layers,
      color: "text-(--color-success)",
    },
    {
      label: "Newsletters",
      value: stats.newsletters,
      icon: Mail,
      color: "text-(--color-accent)",
    },
  ] as const;

  return (
    <div className="px-5 sm:px-8 py-8 max-w-4xl mx-auto">
      {/* Page header */}
      <header className="mb-8">
        <h1 className="font-display font-bold text-2xl text-(--color-text-primary) tracking-tight">
          Overview
        </h1>
        <p className="text-sm text-(--color-text-muted) mt-1">
          Your inbox health at a glance.
        </p>
      </header>

      {/* Gmail just connected */}
      {gmailJustConnected && (
        <div
          role="status"
          className="flex items-start gap-2.5 mb-6 px-4 py-3 rounded-lg bg-(--color-success-muted) border border-(--color-success)/20 text-sm text-(--color-success)">
          <CheckCircle
            size={15}
            className="shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <span>Gmail connected. You're ready to scan your inbox.</span>
        </div>
      )}

      {/* No Gmail access */}
      {!user.hasGmailAccess && (
        <section
          aria-labelledby="connect-heading"
          className={cn(
            cardSection,
            "rounded-2xl p-8 flex flex-col items-center text-center gap-5 mb-8",
          )}>
          <span
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--color-accent-muted) border border-(--color-accent-border)">
            <Mail size={24} className="text-(--color-accent)" />
          </span>
          <div>
            <h2
              id="connect-heading"
              className="font-display font-bold text-lg text-(--color-text-primary) tracking-tight">
              Connect your Gmail
            </h2>
            <p className="mt-2 text-sm text-(--color-text-muted) max-w-sm leading-relaxed">
              Vanta needs read access to scan your inbox and detect what's
              cluttering it.
            </p>
          </div>
          <Button className="shadow-(--shadow-glow-sm)">
            <Link href="/api/auth/google/gmail">
              <Mail size={15} aria-hidden="true" />
              Connect Gmail
            </Link>
          </Button>
          <p className="text-xs text-(--color-text-muted) font-mono">
            Read-only · No content stored · Revoke anytime
          </p>
        </section>
      )}

      {/* Scan status + trigger */}
      {user.hasGmailAccess && (
        <ScanStatus
          scanStatus={user.scanStatus}
          lastScannedAt={user.lastScannedAt}
        />
      )}

      {/* Stats grid */}
      {user.scanStatus === "done" && (
        <>
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
            {STATS.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className={cn(
                  metricCard,
                  "rounded-xl p-5 flex flex-col gap-2",
                )}>
                <div className="flex items-center justify-between">
                  <dt className="text-xs text-(--color-text-muted) font-mono">
                    {label}
                  </dt>
                  <Icon size={14} aria-hidden="true" className={color} />
                </div>
                <dd
                  className={`font-display font-black text-3xl tracking-tight leading-none ${color}`}>
                  {value.toLocaleString()}
                </dd>
              </div>
            ))}
          </dl>

          {/* Quick actions */}
          <section
            aria-labelledby="actions-heading"
            className="card-glass mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 hover:border-(--color-accent-border)">
            <h2 id="actions-heading" className="sr-only">
              Quick actions
            </h2>

            <Link
              href="/dashboard/senders"
              className={cn(
                cardSection,
                "rounded-xl p-5 flex items-start gap-4 hover:border-(--color-accent-border) transition-colors duration-200 group",
              )}>
              <span
                aria-hidden="true"
                className={iconSquare(
                  " bg-(--color-accent-muted) border border-(--color-accent-border) shrink-0 group-hover:bg-(--color-accent) group-hover:text-white transition-all duration-200",
                  "h-10 w-10 rounded-lg",
                )}>
                <Trash2
                  size={16}
                  className="text-(--color-accent) group-hover:text-white transition-colors"
                />
              </span>
              <div>
                <h3 className="font-display font-bold text-sm text-(--color-text-primary) tracking-tight">
                  Manage senders
                </h3>
                <p className="text-xs text-(--color-text-muted) mt-1 leading-relaxed">
                  Review all detected senders and bulk unsubscribe.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/digest"
              className={cn(
                cardSection,
                " rounded-xl p-5 flex items-start gap-4 hover:border-(--color-accent-border) transition-colors duration-200 group",
              )}>
              <span
                aria-hidden="true"
                className={iconSquare(
                  " bg-(--color-accent-muted) border border-(--color-accent-border) shrink-0 group-hover:bg-(--color-accent) group-hover:text-white transition-all duration-200",
                  "h-10 w-10 rounded-lg",
                )}>
                <Layers
                  size={16}
                  className="text-(--color-accent) group-hover:text-white transition-colors"
                />
              </span>
              <div>
                <h3 className="font-display font-bold text-sm text-(--color-text-primary) tracking-tight">
                  Set up digest
                </h3>
                <p className="text-xs text-(--color-text-muted) mt-1 leading-relaxed">
                  Pick newsletters and get one clean daily email.
                </p>
              </div>
            </Link>
          </section>
        </>
      )}
    </div>
  );
}
