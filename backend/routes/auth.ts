import { sessions, subscriptions, users } from "@backend/db/schema";
import { getDb } from "@backend/lib/db";
import { newId, now } from "@backend/lib/id";
import { signToken } from "@backend/lib/jwt";
import { hashPassword, verifyPassword } from "@backend/lib/password";
import { requireAuth } from "@backend/middleware/auth";
import { zValidator } from "@hono/zod-validator";
import { and, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { z } from "zod";

import { passwordResetTokens } from "@backend/db/schema";
import { sendPasswordResetEmail } from "@backend/lib/resend";
import { gt } from "drizzle-orm";

const SESSION_DAYS = 7;
const SESSION_TTL = SESSION_DAYS * 24 * 60 * 60;

const cookieOpts = (env: string) => ({
  httpOnly: true,
  secure: env === "PROD",
  sameSite: "Lax" as const,
  path: "/",
  maxAge: SESSION_TTL,
});

const createSession = async (
  db: ReturnType<typeof getDb>,
  userId: string,
  jwtSecret: string,
) => {
  const sessionId = newId();
  const expiresAt = now() + SESSION_TTL;
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
    createdAt: now(),
  });
  return signToken({ sessionId }, jwtSecret, `${SESSION_DAYS}d`);
};

const signupSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});
const forgotSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
});

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

const auth = new Hono<{ Bindings: CloudflareEnv }>();

// ── Email signup ─────────────────────────────────────────
auth.post("/signup", zValidator("json", signupSchema), async (c) => {
  const { name, email, password } = c.req.valid("json");
  const db = getDb(c.env.DB);

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existing) {
    return c.json({ error: "Email already registered." }, 409);
  }

  const passwordHash = await hashPassword(password);
  const userId = newId();
  const ts = now();

  await db.insert(users).values({
    id: userId,
    name,
    email,
    passwordHash,
    createdAt: ts,
    updatedAt: ts,
  });

  await db.insert(subscriptions).values({
    id: newId(),
    userId,
    plan: "free",
    status: "active",
    createdAt: ts,
    updatedAt: ts,
  });

  const token = await createSession(db, userId, c.env.AUTH_JWT_SECRET);
  setCookie(c, "session", token, cookieOpts(c.env.ENVIRONMENT));

  return c.json({ ok: true, redirect: "/onboarding" });
});

// ── Email login ──────────────────────────────────────────
auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");
  const db = getDb(c.env.DB);

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  const valid = user?.passwordHash
    ? await verifyPassword(password, user.passwordHash)
    : false;

  if (!user || !valid) {
    return c.json({ error: "Invalid email or password." }, 401);
  }

  if (user.deletedAt) {
    return c.json({ error: "Account not found." }, 404);
  }

  const token = await createSession(db, user.id, c.env.AUTH_JWT_SECRET);
  setCookie(c, "session", token, cookieOpts(c.env.ENVIRONMENT));

  return c.json({
    ok: true,
    redirect: user.scanStatus === "done" ? "/dashboard" : "/onboarding",
  });
});

// ── Forgot password ──────────────────────────────────────
auth.post("/forgot-password", zValidator("json", forgotSchema), async (c) => {
  const { email } = c.req.valid("json");
  const db = getDb(c.env.DB);

  // always return 200 — don't leak whether email exists
  const user = await db
    .select({ id: users.id, email: users.email, deletedAt: users.deletedAt })
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (!user || user.deletedAt) {
    return c.json({ ok: true });
  }

  // invalidate existing tokens for this user
  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, user.id));

  const token = crypto.randomUUID();
  const expiresAt = now() + 3600; // 1 hour
  const ts = now();

  await db.insert(passwordResetTokens).values({
    id: newId(),
    userId: user.id,
    token,
    expiresAt,
    createdAt: ts,
  });

  const resetUrl = `${c.env.CLIENT_BASE_URI}/reset-password?token=${token}`;

  await sendPasswordResetEmail(
    user.email,
    resetUrl,
    c.env.RESEND_API_KEY,
    c.env.RESEND_FROM_EMAIL,
  );

  return c.json({ ok: true });
});

// ── Reset password ───────────────────────────────────────
auth.post("/reset-password", zValidator("json", resetSchema), async (c) => {
  const { token, password } = c.req.valid("json");
  const db = getDb(c.env.DB);

  const resetToken = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, now()),
        isNull(passwordResetTokens.usedAt)
      ),
    )
    .get();

  if (!resetToken || resetToken.usedAt) {
    return c.json({ error: "Invalid or expired reset link." }, 400);
  }

  const passwordHash = await hashPassword(password);
  const ts = now();

  await db
    .update(users)
    .set({ passwordHash, updatedAt: ts })
    .where(eq(users.id, resetToken.userId));

  // mark token used
  await db
    .update(passwordResetTokens)
    .set({ usedAt: ts })
    .where(eq(passwordResetTokens.id, resetToken.id));

  // invalidate all sessions
  await db.delete(sessions).where(eq(sessions.userId, resetToken.userId));

  return c.json({ ok: true });
});

// ── Google OAuth — redirect ──────────────────────────────
auth.get("/google", (c) => {
  console.log({ c });
  const redirectUri = `${c.env.CLIENT_BASE_URI}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "openid",
      "email",
      "profile",
      // "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.readonly",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  console.log("🔄 Google Redirect URI being sent:", redirectUri);
  return c.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
});

// ── Google OAuth — callback ──────────────────────────────
auth.get("/google/callback", async (c) => {
  const code = c.req.query("code");
  const error = c.req.query("error");
  const state = c.req.query("state");

  if (error || !code) {
    return c.redirect(`${c.env.CLIENT_BASE_URI}/login?error=oauth_denied`);
  }

  let connectingUserId: string | null = null;
  if (state) {
    try {
      const parsed = JSON.parse(atob(state));
      if (parsed.action === "connect_gmail") {
        connectingUserId = parsed.userId;
      }
    } catch {}
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${c.env.CLIENT_BASE_URI}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return c.redirect(`${c.env.CLIENT_BASE_URI}/login?error=oauth_failed`);
  }

  const tokens = await tokenRes.json<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    id_token: string;
    scope: string;
  }>();

  const grantedScopes = tokens.scope.split(" ");
  const hasGmailAccess = grantedScopes.includes(
    "https://www.googleapis.com/auth/gmail.readonly",
  );

  // Get Google profile
  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${tokens.access_token}` } },
  );

  if (!profileRes.ok) {
    return c.redirect(`${c.env.CLIENT_BASE_URI}/login?error=profile_failed`);
  }

  const profile = await profileRes.json<{
    sub: string;
    email: string;
    name: string;
    picture: string;
  }>();

  const db = getDb(c.env.DB);
  const ts = now();
  const exp = ts + tokens.expires_in;

  if (connectingUserId) {
    await db
      .update(users)
      .set({
        gmailAccessToken: tokens.access_token,
        gmailRefreshToken: tokens.refresh_token ?? undefined,
        gmailTokenExpiry: exp,
        hasGmailAccess,
        avatarUrl: profile.picture,
        updatedAt: ts,
      })
      .where(eq(users.id, connectingUserId));

    return c.redirect(
      `${c.env.CLIENT_BASE_URI}/dashboard/settings?gmail=connected`,
    );
  }

  let user = await db
    .select()
    .from(users)
    .where(eq(users.email, profile.email))
    .get();

  if (user) {
    // Update tokens
    await db
      .update(users)
      .set({
        gmailAccessToken: tokens.access_token,
        gmailRefreshToken: tokens.refresh_token ?? user.gmailRefreshToken,
        gmailTokenExpiry: exp,
        hasGmailAccess,
        avatarUrl: profile.picture,
        updatedAt: ts,
      })
      .where(eq(users.id, user.id));
  } else {
    // New user
    const userId = newId();
    await db.insert(users).values({
      id: userId,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.picture,
      gmailAccessToken: tokens.access_token,
      gmailRefreshToken: tokens.refresh_token,
      gmailTokenExpiry: exp,
      hasGmailAccess,
      createdAt: ts,
      updatedAt: ts,
    });
    await db.insert(subscriptions).values({
      id: newId(),
      userId,
      plan: "free",
      status: "active",
      createdAt: ts,
      updatedAt: ts,
    });
    user = await db
      .select()
      .from(users)
      .where(eq(users.email, profile.email))
      .get();
  }

  if (!user) {
    return c.redirect(`${c.env.CLIENT_BASE_URI}/login?error=user_failed`);
  }

  const token = await createSession(db, user.id, c.env.AUTH_JWT_SECRET);
  setCookie(c, "session", token, cookieOpts(c.env.ENVIRONMENT));

  const scanDone = user.scanStatus === "done" && user.hasGmailAccess;
  return c.redirect(
    scanDone
      ? `${c.env.CLIENT_BASE_URI}/dashboard`
      : `${c.env.CLIENT_BASE_URI}/onboarding`,
  );
});

auth.get("/google/gmail", requireAuth, (c) => {
  const userId = c.get("userId");

  const state = btoa(JSON.stringify({ userId, action: "connect_gmail" }));

  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${c.env.CLIENT_BASE_URI}/api/auth/google/callback`,
    response_type: "code",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/gmail.readonly",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return c.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
});

// ── Logout ───────────────────────────────────────────────
auth.post("/logout", async (c) => {
  deleteCookie(c, "session", { path: "/" });
  return c.redirect(`${c.env?.CLIENT_BASE_URI ?? ""}/login`);
});

// ── Me ───────────────────────────────────────────────────
auth.get("/me", requireAuth, async (c) => {
  const user = c.get("user");
  return c.json({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    scanStatus: user.scanStatus,
  });
});

export default auth;
