# HULUM

> **Your AI opportunity decision agent** — built for Ethiopian students and young professionals.

[![Live App](https://img.shields.io/badge/Live%20App-hulum--alpha.vercel.app-6366f1?style=flat-square&logo=vercel)](https://hulum-alpha.vercel.app)
[![API Health](https://img.shields.io/badge/API-hulum--api.onrender.com-10b981?style=flat-square&logo=render)](https://hulum-api.onrender.com/api/health)
[![Version](https://img.shields.io/badge/version-0.1.0-blue?style=flat-square)](package.json)
[![STARK Hackathon 2026](https://img.shields.io/badge/STARK%20Hackathon-2026-orange?style=flat-square)]()

---

## Problem Statement

Ethiopian students and young professionals face a painful, recurring problem: **opportunity overload with no clear guidance**.

Every year, thousands of scholarships, fellowships, internships, exchange programs, and job opportunities are published across scattered sources — organization websites, Telegram channels, Facebook groups, and email lists. A motivated student might find 20–30 opportunities in a week, but has no structured way to answer the most critical question:

> _"Am I actually eligible for this — and is it worth my time to apply?"_

The consequences are real:

- **Missed opportunities** — students skip listings they could have won because eligibility requirements look overwhelming at first glance
- **Wasted effort** — students spend hours preparing applications for opportunities they were never eligible for
- **Decision paralysis** — without a trusted signal, many do nothing
- **Information asymmetry** — students in Addis Ababa with strong networks get informal guidance; students outside major cities get none
- **No readiness feedback** — even motivated applicants don't know *what to fix* before the next application cycle

Existing tools (search engines, Telegram bots, spreadsheet trackers) surface listings but offer **zero eligibility intelligence**. They tell you *what* exists, not *whether you should apply*.

---

## Our Solution

**HULUM** is an AI opportunity decision agent that closes this gap.

Given a structured profile (education, skills, experience, language, interests) and any opportunity listing, HULUM:

1. **Runs a deterministic eligibility check** — TypeScript logic, not an LLM guess — and returns one of three verdicts: **APPLY**, **MAYBE**, or **SKIP**
2. **Explains the verdict** — shows exactly which requirements are MET, NOT_MET, or UNCERTAIN
3. **Generates a readiness checklist** — concrete to-do items to improve eligibility before the next cycle
4. **Links to the official source** — HULUM never becomes the authority; it always points to the official organization
5. **Works from screenshots** — paste or upload a screenshot of any opportunity, and HULUM extracts the facts and decides

The decision engine is intentionally deterministic. An LLM may *explain* the verdict in natural language, but it never *makes* the verdict. This prevents hallucination from affecting life-changing decisions.

**Who benefits:**
- University students evaluating scholarships and exchange programs
- Recent graduates navigating fellowships and entry-level jobs
- Young professionals tracking career opportunities
- Anyone in Ethiopia (or the diaspora) without access to a strong informal network

---

## What is HULUM?

HULUM compares your saved profile against an opportunity and returns one clear verdict: **APPLY**, **MAYBE**, or **SKIP** — along with the reasoning, what is missing, and what you need to prepare.

The official organization page remains the eligibility authority. A deterministic TypeScript engine makes every decision. Groq may add a natural-language explanation, but it never overrides the verdict.

> **Note:** The free API tier sleeps when idle. The first request may take up to a minute to wake up. Create an account, complete onboarding, then open **Discover**.

---

## Decision Flow

```
Profile  →  Opportunity  →  Fit Analysis  →  APPLY / MAYBE / SKIP
                                                    ↓
                              Why  →  Gap Analysis  →  Readiness Checklist
                                                    ↓
                                        Official Source
```

The fit score (0–100) is a signal only. It never replaces the **APPLY / MAYBE / SKIP** verdict.

---

## Features (v0.1)

### Authentication
- Email & password sign-in with JWT (`X-Hulum-Session` header)
- Google OAuth sign-in
- Forgot password — single-use 30-minute reset link sent by email
- Account creation at `/verify` (registration, not OTP)

### Profile & Onboarding
- 4-step onboarding wizard for new accounts (`/onboarding`)
- Structured profile editor (`/profile`): photo, identity, completeness percentage, education, skills, interests, and languages
- Private CV upload — upload once, then view or update
- Supporting document storage
- Profile photo is display-only and never read by the decision engine

### Discover
- Keyword search and multi-filter browsing over the verified opportunity catalog
- Displays your stored decision alongside each listing
- Never fabricates or invents listings

### APPLY / MAYBE / SKIP
- One deterministic verdict per opportunity or screenshot
- Fit score 0–100 is informational; it never overrides the decision rules
- Screenshot analyze (`/screenshot`) — extracts visible facts (via Groq Vision when keyed), then runs `decide()` against your profile

### Gap Analysis & Readiness
- Each requirement is marked **MET**, **NOT_MET**, or **UNCERTAIN**
- A to-do checklist is generated automatically
- Track preparation progress at `/my-opportunities` and `/readiness`

### Ask HULUM (AI Assistant)
- Text-based assistant with quick-prompt buttons (`/assistant`)
- Microphone input via Voxide (after sign-in, when the domain is whitelisted)
- Falls back gracefully to typed input if voice is unavailable

### Research
- `/research` available when a ScholarXIV server key is configured
- Research papers are informational only — they never influence APPLY / MAYBE / SKIP

### Light & Dark Mode
- Follows OS preference by default; user can override

### Opportunity Catalog
- Catalog populated by the investigator worker from evidenced, sourced pages
- Each opportunity carries a `sourceUrl` (eligibility authority) and `applicationUrl` (where to apply)
- HULUM analysis is never the official source

---

## Out of Scope (v0.1)

- Auto-apply, payments, and native mobile app
- Inventing or scraping unsourced listings
- Using ScholarXIV papers as eligibility evidence
- The footer "Subscribe" box does not store email addresses

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Web** | Next.js 15, TypeScript, Tailwind CSS 4 | Runs on `:3000` |
| **API** | Express, TypeScript | Runs on `:3001` |
| **Database** | PostgreSQL via `DATABASE_URL` | JSON file store available for tests |
| **Decision Engine** | `apps/server/src/decision/decide.ts` | Deterministic TypeScript — LLMs never decide |
| **Explanation** | Groq (`GROQ_API_KEY`, `GROQ_MODEL`) | Explains stored analyses; never changes verdict |
| **Voice** | Voxide microphone widget | Amharic/Oromo recognition quality not guaranteed |
| **Research** | ScholarXIV API (`SCHOLARXIV_API_KEY`) | Server-only; papers never decide outcomes |
| **Hosting** | Vercel (web) + Render (API) | Local `npm run dev` also supported |
| **CI** | GitHub Actions | Typecheck, lint, test, smoke on every push/PR |

---

## Repository Structure

```
hulum/
├── apps/
│   ├── web/            # Next.js frontend
│   │   └── src/app/    # /, /onboarding, /opportunities, /opportunities/[id],
│   │                   # /my-opportunities, /readiness, /assistant,
│   │                   # /profile, /screenshot, /research
│   └── server/         # Express API
│       └── src/
│           ├── decision/       # Deterministic decide() engine
│           ├── auth/           # JWT + Google OAuth
│           ├── profiles/       # Profile CRUD, documents, photo
│           ├── opportunities/  # Catalog and analysis
│           ├── readiness/      # Gap analysis + checklists
│           ├── investigator/   # Background catalog worker
│           ├── ai/             # Groq explain + screenshot analyze
│           ├── voice/          # Voxide session and action
│           └── scholarxiv/     # Research paper integration
├── packages/
│   └── shared/         # Zod schemas + shared TypeScript contracts (@hulum/shared)
└── database/
    └── migrations/     # 17 PostgreSQL migration files (001–017)
```

---

## Getting Started

### Prerequisites

- **Node.js >= 20**
- **PostgreSQL** database (local or remote — e.g., Supabase)

### Local Setup

```bash
# 1. Clone and install dependencies
git clone <repo-url>
cd hulum
npm install

# 2. Configure environment
copy .env.example .env
# Edit .env — set DATABASE_URL and CLIENT_URL=http://localhost:3000

# 3. Apply database migrations
npm run db:migrate

# 4. Start both web and API concurrently
npm run dev
```

| Service | URL |
|---|---|
| Web | http://localhost:3000 |
| API | http://localhost:3001 |
| API Health | http://localhost:3001/api/health → `{ "data": { "status": "ok" }, "error": null }` |

**API only:**
```bash
cp apps/server/.env.example apps/server/.env
npm run db:migrate
npm run dev:server
```

> Never put real secrets in chat or commit them to Git. `.env.example` contains variable names only.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start web (:3000) and API (:3001) concurrently |
| `npm run dev:web` | Start web only |
| `npm run dev:server` | Start API only |
| `npm run build` | Production build for the web app |
| `npm run db:migrate` | Apply all SQL migrations in `database/migrations/` |
| `npm run db:seed` | Seed the database |
| `npm test` | Run all server tests (Vitest) |
| `npm run test:server` | Run server tests explicitly |
| `npm run smoke:local` | Health + register + catalog list smoke test |
| `npm run smoke:browser` | Chromium click-through smoke test (Playwright) |
| `npm run smoke:password-reset` | Password reset flow smoke test |
| `npm run lint` | ESLint across all packages |
| `npm run format:check` | Prettier check across all packages |
| `npm run format` | Auto-format all source files |

---

## API Reference

All responses follow the envelope: `{ "data": ..., "error": ... }`.
Authenticated requests must include the `X-Hulum-Session` JWT header.

```http
# Health
GET    /api/health

# Auth
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/auth/google
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

# Profile
POST   /api/profile
GET    /api/profile/:userId
PATCH  /api/profile/:userId
POST   /api/profile/:userId/documents     # optional replacesId swaps a file in place
GET    /api/profile/:userId/photo
POST   /api/profile/:userId/photo
DELETE /api/profile/:userId/photo

# Opportunities & Analysis
GET    /api/opportunities
GET    /api/opportunities/:id
POST   /api/opportunities/:id/analyze
GET    /api/analyses/:id
POST   /api/analyses/:id/explain          # Optional Groq explanation
GET    /api/analyses/:id/readiness
PATCH  /api/readiness/:id

# AI & Voice
POST   /api/ai/screenshot-analyze
POST   /api/voice/session
POST   /api/voice/action
```

---

## Environment Variables

### Required (Local Development)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLIENT_URL` | Web origin for CORS (e.g. `http://localhost:3000`) |

### Required (Production)

| Variable | Description |
|---|---|
| `NODE_ENV` | Set to `production` — disables localhost CORS fallback |
| `CLIENT_URL` | Web origin, no trailing path |
| `SESSION_SECRET` | JWT signing secret (`X-Hulum-Session`) |
| `NEXT_PUBLIC_API_URL` | Browser-facing API URL (e.g., the Render service URL) |
| `API_PUBLIC_URL` | API origin for Google OAuth callback |

### Optional

| Variable | Description |
|---|---|
| `GROQ_API_KEY` + `GROQ_MODEL` | Explain stored analyses; never decides APPLY/MAYBE/SKIP |
| `GROQ_VISION_MODEL` | Screenshot extraction via Groq Vision |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `NEXT_PUBLIC_VOXIDE_KEY` | Voxide publishable key (`vox_pub_...`) — domain must be whitelisted in Voxide dashboard |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` | Password reset emails |
| `SCHOLARXIV_API_KEY` | ScholarXIV research integration (server-only) |
| `INVESTIGATE_WORKER` | Enable background investigator (`true`/`false`) |
| `DATABASE_CONNECT_TIMEOUT_MS` | PostgreSQL connection timeout in ms (default: 5000) |

> The API refuses to start in production without `CLIENT_URL` and `SESSION_SECRET`.

---

## Opportunity Verification

`GET /api/opportunities` returns an **effective** `verificationStatus` (the database row is never rewritten):

| Status | Condition |
|---|---|
| `EXPIRED` | Status is expired, **or** deadline is before today (UTC) |
| `NEEDS_REVIEW` | A `VERIFIED` row with no `lastVerifiedAt`, verified > 30 days ago, or missing `sourceUrl` |
| `VERIFIED` | Actively verified with a recent `lastVerifiedAt` and a valid `sourceUrl` |

- `sourceUrl` — the eligibility and deadline authority
- `applicationUrl` — where to submit the application
- HULUM analysis is never the official source; `OFFICIAL_SOURCE_NOTICE` is included in every analysis summary (from `@hulum/shared`)

---

## Database Migrations

Migrations live in `database/migrations/` and are applied sequentially by `npm run db:migrate`.

| File | Description |
|---|---|
| `001_init.sql` | Core schema (users, profiles, opportunities, analyses) |
| `002_investigator.sql` | Investigator job queue tables |
| `003_analysis_decision_audit.sql` | Decision audit log |
| `004_rls_owner_policies.sql` | Row-level security policies |
| `005_investigator_worker.sql` | Worker state tracking |
| `006_close_catalog_seed.sql` | Catalog seeding utilities |
| `007_user_password_hash.sql` | Password hash column |
| `008_user_google_sub.sql` | Google OAuth subject field |
| `009_profile_documents.sql` | Document storage metadata |
| `010_profile_document_text.sql` | Extracted document text |
| `011_saved_opportunities.sql` | Saved/bookmarked opportunities |
| `012_afriwork_jobs_source.sql` | Afriwork source tracking |
| `013_ethioscholarship_catalog.sql` | EthioScholarship catalog entries |
| `014_hulum_app_role.sql` | Application-level DB role |
| `015_ci_smoke_investigator_row.sql` | CI smoke test fixture |
| `016_password_reset_tokens.sql` | Password reset token storage |
| `017_profile_photo_and_file_names.sql` | Profile photo and file name metadata |

---

## Shared Contracts

Web and server import types and constants from `@hulum/shared` (at `packages/shared/`).

- Zod schemas for all API request/response shapes
- `OFFICIAL_SOURCE_NOTICE` — included in every analysis summary
- `SHOW_MISSING_REQUIREMENTS` — used by Ask HULUM (not `SHOW_GAPS`)

---

## Deployment

### Web → Vercel

`apps/web/vercel.json` configures the Next.js build. Set `NEXT_PUBLIC_API_URL` to your Render API URL in the Vercel environment settings.

### API → Render

`render.yaml` is the Render Blueprint for the Express API. Connect via **New → Blueprint → this repo** and fill in all `sync: false` values in the Render dashboard.

Key Render settings:

- **Region:** Frankfurt
- **Health check:** `GET /api/health`
- **Start command:** `npm run start -w @hulum/server`
- `INVESTIGATE_WORKER=false` — the free plan does not install Chromium; enable only on a larger plan

---

## CI / CD

GitHub Actions (`.github/workflows/`) runs on every push and pull request:

- TypeScript typecheck across all packages
- ESLint lint
- Vitest unit and integration tests
- Smoke tests (health, register, catalog)

---

## Disclaimer

HULUM is a decision aid, not an official eligibility authority. It reasons from declared profile facts and stored opportunity records. Always confirm requirements and deadlines directly with the official organization before applying.

---

## Team

**Team Ethiopian Builders** — built for the STARK Hackathon 2026.

| Name | Role |
|---|---|
| **Kidist** | Product, frontend, UX, voice experience, demo |
| **Mulualem** | Backend, database, decision engine, infrastructure |
