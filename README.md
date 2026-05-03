# Vanta

Gmail inbox manager. Connect your Gmail, scan your inbox, identify senders, bulk unsubscribe, and set up digest emails.

> **Status:** Early development. Gmail scan and auth are tested. Unsubscribe and digest features are work in progress.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) + Tailwind CSS 4 |
| Backend | Hono on Cloudflare Workers |
| Database | Drizzle ORM + Cloudflare D1 (SQLite) |
| Auth | Custom JWT (jose) + Google OAuth 2.0 |
| Email | Resend + React Email |
| Async Jobs | Cloudflare Queues (scan, unsubscribe, digest) |
| Deployment | OpenNext → Cloudflare Workers |

---

## Local Development

### Prerequisites

- Node.js 20+
- A Google Cloud project with OAuth 2.0 credentials
- A Resend account

### Setup

```bash
# Install dependencies
npm install

# Copy env template
cp .example.vars .dev.vars
# Fill in .dev.vars with your keys

# Apply DB migrations locally
npm run db:migrate:local

# Start Next.js dev server (port 3000)
npm run dev

# OR preview on the real Cloudflare Workers runtime (port 8787)
npm run preview
```

### Environment Variables

```env
ENVIRONMENT=DEV
CLIENT_BASE_URI=http://localhost:3000
AUTH_JWT_SECRET=<random 32+ char string>
GOOGLE_CLIENT_ID=<Google Cloud Console>
GOOGLE_CLIENT_SECRET=<Google Cloud Console>
RESEND_API_KEY=<Resend dashboard>
RESEND_FROM_EMAIL=onboarding@resend.dev
```

D1, Queues, and KV bindings are injected automatically by Wrangler — do not pass them as env vars.

---

## Database

```bash
# Generate migration after schema changes
npm run db:generate

# Apply to local D1
npm run db:migrate:local

# Apply to remote (prod) D1
npm run db:migrate:remote
```

Schema lives in `backend/db/schema.ts`.

---

## Project Structure

```
├── src/                    # Next.js frontend (App Router)
│   ├── app/(auth)/         # Login, signup, forgot/reset password
│   ├── app/(dashboard)/    # Dashboard, senders, digest, settings
│   ├── app/(legal)/        # Privacy policy, terms of service
│   └── components/
├── backend/                # Hono API (Cloudflare Workers)
│   ├── routes/             # One file per feature
│   ├── workers/            # Queue consumers: scan, unsub, digest
│   ├── middleware/         # Auth, error handling
│   ├── lib/                # Gmail, JWT, Resend utils
│   └── db/                 # Drizzle schema + migrations
└── worker.ts               # Cloudflare Worker entry point
```

---

## Deployment

```bash
npm run deploy
```

Builds with OpenNext and deploys to Cloudflare Workers. Requires `wrangler login` or `CLOUDFLARE_API_TOKEN` in the environment.

---

## Adding a New API Route

1. Create `backend/routes/myfeature.ts`, export a Hono router
2. Register in `backend/index.ts`: `app.route("/api/myfeature", myRouter)`
3. Protect with `requireAuth` middleware if needed
4. Validate input with Zod + `zValidator("json", schema)`
