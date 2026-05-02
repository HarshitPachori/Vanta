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
  id: string;
  payload: {
    headers: GmailMessageHeader[];
  };
  internalDate: string;
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
        `${GMAIL_BASE}/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=List-Unsubscribe&metadataHeaders=Date&metadataHeaders=Precedence&metadataHeaders=X-Mailer&metadataHeaders=X-Campaign-Id`,
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
  precedence?: string,
  xMailer?: string,
): "newsletter" | "promo" | "transactional" | "social" | "cold" | "other" => {
  if (
    precedence?.toLowerCase() === "bulk" ||
    precedence?.toLowerCase() === "list"
  ) {
    return hasUnsubscribeHeader ? "newsletter" : "promo";
  }

  // known ESP tools → promo/newsletter
  const espKeywords = [
    "mailchimp",
    "sendgrid",
    "klaviyo",
    "hubspot",
    "marketo",
    "campaign monitor",
  ];
  if (xMailer && espKeywords.some((k) => xMailer.toLowerCase().includes(k))) {
    return hasUnsubscribeHeader ? "newsletter" : "promo";
  }
  const e = email.toLowerCase();
  const n = displayName.toLowerCase();

  const socialDomains = [
    "linkedin.com",
    "twitter.com",
    "x.com",
    "facebook.com",
    "instagram.com",
    "tiktok.com",
  ];
  if (socialDomains.some((d) => e.includes(d))) return "social";

  const transactionalKeywords = [
    "noreply",
    "no-reply",
    "notifications",
    "support",
    "billing",
    "invoice",
    "receipt",
    "order",
    "shipping",
  ];
  if (transactionalKeywords.some((k) => e.includes(k) || n.includes(k)))
    return "transactional";

  const newsletterKeywords = [
    "newsletter",
    "digest",
    "weekly",
    "daily",
    "morning",
    "substack",
    "medium",
    "brew",
  ];
  if (newsletterKeywords.some((k) => e.includes(k) || n.includes(k)))
    return "newsletter";
  if (hasUnsubscribeHeader) return "newsletter";

  const promoKeywords = [
    "promo",
    "offer",
    "deal",
    "sale",
    "discount",
    "marketing",
    "campaigns",
  ];
  if (promoKeywords.some((k) => e.includes(k) || n.includes(k))) return "promo";

  return "other";
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
