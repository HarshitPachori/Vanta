import { users } from "@backend/db/schema";
import type { Db } from "@backend/lib/db";
import { now } from "@backend/lib/id";
import { eq } from "drizzle-orm";

type GmailMessage = {
  id: string;
  threadId: string;
};

type GmailMessageHeader = {
  name: string;
  value: string;
};

type GmailMessageDetail = {
  id:           string;
  threadId:     string;
  labelIds:     string[];
  snippet:      string;
  sizeEstimate: number;
  internalDate: string;
  payload: {
    mimeType: string;
    filename: string;
    headers:  GmailMessageHeader[];
  };
};

type GmailListResponse = {
  messages?: GmailMessage[];
  nextPageToken?: string;
};

const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

const refreshAccessToken = async (
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<{ accessToken: string; expiresAt: number } | null> => {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const data = await res.json<{ access_token: string; expires_in: number }>();
  return {
    accessToken: data.access_token,
    expiresAt: now() + data.expires_in,
  };
};

export const getValidAccessToken = async (
  db: Db,
  userId: string,
  env: Pick<CloudflareEnv, "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET">,
): Promise<string | null> => {
  const user = await db
    .select({
      gmailAccessToken: users.gmailAccessToken,
      gmailRefreshToken: users.gmailRefreshToken,
      gmailTokenExpiry: users.gmailTokenExpiry,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!user?.gmailAccessToken || !user.gmailRefreshToken) return null;

  // Refresh if expiring within 5 minutes
  if (user.gmailTokenExpiry && user.gmailTokenExpiry > now() + 300) {
    return user.gmailAccessToken;
  }

  const refreshed = await refreshAccessToken(
    user.gmailRefreshToken,
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
  );

  if (!refreshed) {
    await db
      .update(users)
      .set({ scanStatus: "token_expired", updatedAt: now() })
      .where(eq(users.id, userId));
    return null;
  }

  await db
    .update(users)
    .set({
      gmailAccessToken: refreshed.accessToken,
      gmailTokenExpiry: refreshed.expiresAt,
      updatedAt: now(),
    })
    .where(eq(users.id, userId));

  return refreshed.accessToken;
};

export const listMessageIds = async (
  accessToken: string,
  query: string,
  maxResults = 500,
): Promise<string[]> => {
  const ids: string[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      q: query,
      maxResults: String(Math.min(maxResults - ids.length, 500)),
      ...(pageToken ? { pageToken } : {}),
    });

    const res = await fetch(`${GMAIL_BASE}/messages?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log({ res });

    if (!res.ok) break;

    const data = await res.json<GmailListResponse>();
    console.log({ data });

    const batch = data.messages?.map((m) => m.id) ?? [];
    ids.push(...batch);
    pageToken = data.nextPageToken;

    if (ids.length >= maxResults) break;
  } while (pageToken);

  return ids;
};

export const batchGetMessageHeaders = async (
  accessToken: string,
  messageIds: string[],
): Promise<GmailMessageDetail[]> => {
  // Gmail batch HTTP — process in chunks of 100
  const CHUNK = 100;
  const results: GmailMessageDetail[] = [];

  for (let i = 0; i < messageIds.length; i += CHUNK) {
    const chunk = messageIds.slice(i, i + CHUNK);

    const fetches = chunk.map((id) =>
      fetch(
        `${GMAIL_BASE}/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=List-Unsubscribe&metadataHeaders=Date&metadataHeaders=Precedence&metadataHeaders=X-Mailer&metadataHeaders=X-Campaign-Id&metadataHeaders=Auto-Submitted`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      ).then((r) => (r.ok ? r.json<GmailMessageDetail>() : null)),
    );
    console.log({ fetches });

    const settled = await Promise.allSettled(fetches);
    for (const s of settled) {
      if (s.status === "fulfilled" && s.value) results.push(s.value);
    }

    // Respect Gmail quota — 100ms between chunks
    if (i + CHUNK < messageIds.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return results;
};

export const getHeader = (
  headers: GmailMessageHeader[],
  name: string,
): string | undefined =>
  headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value;

export const parseFrom = (
  fromHeader: string,
): { email: string; displayName: string } => {
  const match = fromHeader.match(/^(?:"?([^"<]*)"?\s*)?<?([^>]+)>?$/);
  return {
    displayName: match?.[1]?.trim() || match?.[2] || fromHeader,
    email: match?.[2]?.trim().toLowerCase() || fromHeader.toLowerCase(),
  };
};

export const parseUnsubscribeHeader = (
  header: string,
): { mailto?: string; http?: string } => {
  const result: { mailto?: string; http?: string } = {};
  const parts = header.split(",").map((p) => p.trim().replace(/^<|>$/g, ""));
  for (const part of parts) {
    if (part.startsWith("mailto:")) result.mailto = part;
    else if (part.startsWith("http")) result.http = part;
  }
  return result;
};

export const categorizeSender = (
  email: string,
  displayName: string,
  hasUnsubscribeHeader: boolean,
  labelIds?: string[],
  precedence?: string,
  xMailer?: string,
  xCampaignId?: string,
  autoSubmitted?: string,
): "newsletter" | "promo" | "transactional" | "social" | "cold" | "other" => {
  const e = email.toLowerCase()
  const n = displayName.toLowerCase()
  const localPart = e.split("@")[0]

  // ── Tier 1: Gmail labels (trust Google's ML first) ───────────────────────
  if (labelIds?.includes("CATEGORY_SOCIAL")) return "social"
  if (labelIds?.includes("CATEGORY_FORUMS")) return "newsletter"

  if (labelIds?.includes("CATEGORY_PROMOTIONS")) {
    const editorialKw = ["newsletter", "digest", "weekly", "daily", "morning", "substack", "medium", "brew", "letter", "roundup", "bulletin", "dispatch"]
    if (hasUnsubscribeHeader && editorialKw.some((k) => e.includes(k) || n.includes(k))) return "newsletter"
    return "promo"
  }

  if (labelIds?.includes("CATEGORY_UPDATES")) {
    return hasUnsubscribeHeader ? "newsletter" : "transactional"
  }

  if (labelIds?.includes("CATEGORY_PERSONAL")) {
    const hasAutomation =
      hasUnsubscribeHeader ||
      !!xCampaignId ||
      !!(autoSubmitted && autoSubmitted.toLowerCase() !== "no") ||
      !!(precedence && ["bulk", "list", "junk"].includes(precedence.toLowerCase()))
    if (!hasAutomation) return "cold"
    // has automation signals despite personal label — fall through
  }

  // ── Tier 2: Explicit automation headers ──────────────────────────────────
  // Auto-Submitted: auto-generated / auto-replied = system-triggered email
  if (autoSubmitted && autoSubmitted.toLowerCase() !== "no") return "transactional"

  // X-Campaign-Id = bulk marketing run
  if (xCampaignId) return hasUnsubscribeHeader ? "newsletter" : "promo"

  // Known ESP X-Mailer values
  const espKeywords = [
    "mailchimp", "sendgrid", "klaviyo", "hubspot", "marketo",
    "campaign monitor", "netcorecloud", "customer.io", "customerio",
    "brevo", "sendinblue", "activecampaign", "constant contact",
    "mailerlite", "convertkit", "drip", "iterable", "sailthru",
  ]
  if (xMailer && espKeywords.some((k) => xMailer.toLowerCase().includes(k))) {
    return hasUnsubscribeHeader ? "newsletter" : "promo"
  }

  if (precedence) {
    const p = precedence.toLowerCase()
    if (p === "bulk" || p === "list") return hasUnsubscribeHeader ? "newsletter" : "promo"
    if (p === "junk") return "promo"
  }

  // ── Tier 3: Social network domains ───────────────────────────────────────
  const socialDomains = [
    "linkedin.com", "twitter.com", "x.com", "facebook.com",
    "instagram.com", "tiktok.com", "pinterest.com", "snapchat.com", "reddit.com",
  ]
  if (socialDomains.some((d) => e.includes(d))) return "social"

  // ── Tier 4: Email address / display name patterns ────────────────────────

  // Exact local-part matches for the strongest transactional signals
  const exactTransactional = [
    "noreply", "no-reply", "no_reply", "donotreply", "do-not-reply", "do_not_reply",
    "mailer-daemon", "postmaster", "bounce", "bounces",
  ]
  if (exactTransactional.includes(localPart)) return "transactional"

  // Broader transactional patterns in full email or display name
  const transactionalPatterns = [
    "noreply", "no-reply", "no_reply", "donotreply",
    "notifications@", "notification@", "alerts@", "alert@",
    "confirm@", "confirmation@", "verify@", "verification@",
    "billing@", "invoice@", "invoices@", "receipt@", "receipts@",
    "orders@", "order-confirm", "shipping@", "shipment@", "delivery@",
    "account@", "security@", "password@", "reset@",
    "automated@", "system@", "auto@", "bot@",
    "service@", "transact", "updates@",
  ]
  if (transactionalPatterns.some((k) => e.includes(k))) return "transactional"

  // Transactional keywords in display name
  const transactionalNameKw = [
    "notifications", "alerts", "billing", "invoice", "receipt",
    "order", "shipping", "delivery", "security", "confirm", "verification",
  ]
  if (transactionalNameKw.some((k) => n.includes(k))) return "transactional"

  // Newsletter / editorial content patterns
  const newsletterKw = [
    "newsletter", "digest", "weekly", "daily", "morning",
    "substack", "medium", "brew", "letter", "roundup",
    "bulletin", "dispatch", "briefing",
  ]
  if (newsletterKw.some((k) => e.includes(k) || n.includes(k))) return "newsletter"

  // Promo patterns
  const promoKw = [
    "promo", "promotions", "offer", "offers", "deals", "deal",
    "sale", "discount", "discounts", "marketing", "campaign",
    "coupon", "savings", "special",
  ]
  if (promoKw.some((k) => e.includes(k) || n.includes(k))) return "promo"

  // ── Tier 5: Unsubscribe = some form of opted-in bulk email ───────────────
  if (hasUnsubscribeHeader) return "newsletter"

  // ── Tier 6: Fallback ─────────────────────────────────────────────────────
  // No automation signals + no keywords + no Gmail category = unknown
  // Don't label as cold without the CATEGORY_PERSONAL signal — too risky
  return "other"
};

export const archiveMessages = async (
  accessToken: string,
  messageIds: string[],
): Promise<void> => {
  const CHUNK = 50;
  for (let i = 0; i < messageIds.length; i += CHUNK) {
    const chunk = messageIds.slice(i, i + CHUNK);
    await fetch(`${GMAIL_BASE}/messages/batchModify`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: chunk,
        removeLabelIds: ["INBOX"],
        addLabelIds: [],
      }),
    });
    if (i + CHUNK < messageIds.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
};

export const createGmailFilter = async (
  accessToken: string,
  senderEmail: string,
): Promise<boolean> => {
  const res = await fetch(`${GMAIL_BASE}/settings/filters`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      criteria: { from: senderEmail },
      action: { removeLabelIds: ["INBOX"], addLabelIds: ["TRASH"] },
    }),
  });
  return res.ok;
};
