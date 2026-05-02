export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyToken } from "@backend/lib/jwt";
import { getDb } from "@backend/lib/db";
import {
  sessions,
  digests,
  digestSenders,
  senders,
  users,
} from "@backend/db/schema";
import { eq, and, gt, desc } from "drizzle-orm";
import type { Metadata } from "next";
import DigestClient from "@/components/dashboard/digest-client";
import { requireOnboarding } from "@/lib/auth";
import { cardSection, cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Digest — Vanta" };

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
    const nowSec = Math.floor(Date.now() / 1000);

    const session = await db
      .select()
      .from(sessions)
      .where(
        and(eq(sessions.id, payload.sessionId), gt(sessions.expiresAt, nowSec)),
      )
      .get();

    if (!session) return null;

    const user = await db
      .select({ id: users.id, scanStatus: users.scanStatus })
      .from(users)
      .where(eq(users.id, session.userId))
      .get();

    if (!user) return null;

    // all available senders (newsletter + promo only — good digest candidates)
    const allSenders = await db
      .select()
      .from(senders)
      .where(eq(senders.userId, user.id))
      .orderBy(desc(senders.emailCount))
      .all();

    // existing digest
    const digest = await db
      .select()
      .from(digests)
      .where(eq(digests.userId, user.id))
      .get();

    // digest senders
    const digestSenderIds = digest
      ? (
          await db
            .select({ senderId: digestSenders.senderId })
            .from(digestSenders)
            .where(eq(digestSenders.digestId, digest.id))
            .all()
        ).map((r) => r.senderId)
      : [];

    return { user, allSenders, digest: digest ?? null, digestSenderIds };
  } catch {
    return null;
  }
};

export default async function DigestPage() {
  await requireOnboarding();
  const data = await getData();
  if (!data) redirect("/login");

  return (
    <div className="px-5 sm:px-8 py-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display font-bold text-2xl text-(--color-text-primary) tracking-tight">
          Digest
        </h1>
        <p className="text-sm text-(--color-text-muted) mt-1">
          Pick senders and get one clean daily email instead of dozens.
        </p>
      </header>

      {data.user.scanStatus !== "done" && (
        <div className={cn(cardSection, " rounded-xl p-6 text-center")}>
          <p className="text-sm text-(--color-text-muted)">
            Scan your inbox first to see available senders.
          </p>
        </div>
      )}

      {data.user.scanStatus === "done" && (
        <DigestClient
          allSenders={data.allSenders}
          initialDigest={data.digest}
          initialSenderIds={data.digestSenderIds}
        />
      )}
    </div>
  );
}

// export default function DigestPage() {
//   return (
//     <div className="px-5 sm:px-8 py-8 max-w-4xl mx-auto">
//       <header className="mb-8">
//         <h1 className="font-display font-bold text-2xl text-(--color-text-primary) tracking-tight">
//           Digest
//         </h1>
//         <p className="text-sm text-(--color-text-muted) mt-1">
//           Pick newsletters and get one clean daily email.
//         </p>
//       </header>
//       <div className="card-glass rounded-2xl p-10 flex flex-col items-center text-center gap-3">
//         <p className="text-sm text-(--color-text-muted)">Digest configuration coming soon.</p>
//         <p className="text-xs text-(--color-text-muted) font-mono">Scan your inbox first to see available senders.</p>
//       </div>
//     </div>
//   )
// }
