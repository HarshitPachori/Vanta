# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

**Vanta** — AI Gmail inbox manager. Users connect Gmail (read-only OAuth), app scans inbox, finds/categorizes senders (newsletters, promos, transactional, etc.), lets them bulk unsubscribe + set up digest emails.

## Tech Stack

- **Frontend:** Next.js (App Router) + React + Tailwind CSS 4
- **Backend:** Hono (edge HTTP framework) deployed on Cloudflare Workers
- **Database:** Drizzle ORM + Cloudflare D1 (SQLite)
- **Auth:** Custom JWT (jose) + sessions table + Google OAuth 2.0
- **Email:** Resend API + React Email templates
- **Async jobs:** Cloudflare Queues (scan, unsubscribe, digest)
- **Deployment:** OpenNext (compiles Next.js → Cloudflare Workers format)

## Commands

```bash
# Local Next.js dev server (port 3000)
npm run dev

# Preview on real Cloudflare Workers runtime locally (port 8787)
npm run preview

npm run lint
npm run format       # Prettier

# Database
npm run db:generate         # Generate migration from schema changes
npm run db:migrate:local    # Apply migrations to local D1
npm run db:migrate:remote   # Apply migrations to remote prod D1

# Deploy
npm run deploy       # Build + deploy to Cloudflare Workers (prod)
npm run cf-typegen   # Regenerate Cloudflare env types (after wrangler.jsonc changes)
```

## Architecture

### Two Entry Points

Two separate runtimes, same repo:

1. **`worker.ts`** — Cloudflare Worker entry. Handles `fetch` (proxies to Next.js via OpenNext), `queue` (dispatches to scan/unsub/digest workers), `scheduled` (cron → digest scheduler).

2. **`src/`** — Next.js frontend (App Router). Server Components auth-check via `src/lib/auth.ts`. Frontend talks backend via `fetch` to `/api/*` routes, `credentials: 'include'` for cookie auth.

### Backend Structure (`backend/`)

- **`index.ts`** — Hono app wiring: CORS, rate limiting, auth middleware, route registration
- **`routes/`** — One file per feature; each exports Hono router registered in `index.ts`
- **`middleware/auth.ts`** — `requireAuth`: validates JWT, looks up session + user in D1
- **`lib/`** — Shared utils: `gmail.ts` (Gmail API calls), `jwt.ts`, `password.ts` (PBKDF2), `resend.ts`, `rate-limit.ts`
- **`workers/`** — Cloudflare Queue consumers: `scan-workers.ts`, `unsub-workers.ts`, `digest-workers.ts`, `digest-scheduler.ts`
- **`db/schema.ts`** — Single source of truth for all tables

### Frontend Structure (`src/`)

- **`src/app/(auth)/`** — Public pages (signup, login, forgot/reset password)
- **`src/app/(dashboard)/`** — Protected pages; layout checks auth, redirects if not logged in
- **`src/app/(dashboard)/onboarding/`** — Gmail connect + initial scan flow
- **`src/lib/auth.ts`** — `getAuthStatus()`, `isLoggedIn()`, `requireOnboarding()` used in Server Components

### TypeScript Path Aliases

- `@/*` → `src/*`
- `@backend/*` → `backend/*`

## Data Flow for Key Features

### Gmail Scan (async)
`POST /api/scan` → sets `user.scanStatus = scanning` → pushes to `SCAN_QUEUE` → `scan-workers.ts` fetches Gmail headers, upserts `senders` table → sets `scanStatus = done`. Frontend polls via SSE at `GET /api/sse/scan` (2s intervals, 2min timeout).

### Unsubscribe (async)
`POST /api/senders/unsubscribe` with sender IDs → creates `unsubscribeJobs` rows → pushes to `UNSUB_QUEUE` → `unsub-workers.ts` tries HTTP unsubscribe (from `List-Unsubscribe` header), falls back to Gmail filter. Max 3 retries.

### Digest Emails (cron)
Cron `*/15 * * * *` → `digest-scheduler.ts` checks due digests (respects user timezone + delivery time) → pushes to `DIGEST_QUEUE` → `digest-workers.ts` fetches recent Gmail messages from digest senders → builds HTML email → sends via Resend → updates `lastSentAt`.

## Database Schema Key Points

All timestamps: **Unix seconds** (not ISO strings or milliseconds). Tables: `users`, `sessions`, `senders`, `unsubscribeJobs`, `digests`, `digestSenders`, `subscriptions`, `passwordResetTokens`.

User deletion = soft delete: sensitive fields (password hash, OAuth tokens, email) nulled; referential cascades clean up senders, jobs, digests.

Sessions expire 7 days. JWT payload: only `{ sessionId }` — user data always fetched from DB per request.

## Environment Variables

Copy `.example.vars` → `.dev.vars` for local dev:

```
ENVIRONMENT=DEV
CLIENT_BASE_URI=http://localhost:3000
AUTH_JWT_SECRET=<random string>
GOOGLE_CLIENT_ID=<Google Cloud Console>
GOOGLE_CLIENT_SECRET=<Google Cloud Console>
RESEND_API_KEY=<Resend dashboard>
RESEND_FROM_EMAIL=onboarding@resend.dev
```

D1 (`DB`), Queues (`SCAN_QUEUE`, `UNSUB_QUEUE`, `DIGEST_QUEUE`), KV bindings auto-injected by Wrangler at runtime — do not pass as env vars.

## Adding a New API Route

1. Create `backend/routes/myfeature.ts`, export Hono router
2. Register in `backend/index.ts`: `app.route("/api/myfeature", myRouter)`
3. Protect with `requireAuth` middleware if needed
4. Validate input with Zod + `zValidator("json", schema)` (Hono built-in)

## Modifying the Database Schema

1. Edit `backend/db/schema.ts`
2. `npm run db:generate` — creates SQL migration in `backend/db/migrations/`
3. `npm run db:migrate:local` for dev; `npm run db:migrate:remote` for prod

## Pre-commit Hooks

Husky + lint-staged runs Prettier on staged `*.{js,ts,jsx,tsx,json,css,md}`. Do not use `--no-verify`.