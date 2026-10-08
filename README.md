# HULUM

**Your AI opportunity decision agent.**

HULUM compares a saved profile with an opportunity and returns one answer: **APPLY**, **MAYBE**, or **SKIP** — then why, what is missing, and what to prepare. The official organization page stays the eligibility authority. A TypeScript engine makes the decision. Groq may explain it. Groq does not change it.

Built for Ethiopian students and young professionals (STARK Hackathon 2026). Team Ethiopian Builders: Kidist (product, web, demo) and Mulualem (API, database, decision engine).

**Try it:** [https://hulum-alpha.vercel.app](https://hulum-alpha.vercel.app)  
**API health:** [https://hulum-api.onrender.com/api/health](https://hulum-api.onrender.com/api/health)

The free API sleeps when idle. The first open can take about a minute. Create an account, finish onboarding, then open Discover. The problem statement is [docs/product/problem.md](docs/product/problem.md). Judges: [docs/stark/README.md](docs/stark/README.md), then [docs/demo/script.md](docs/demo/script.md).

---

## Core loop

```
Profile  →  Opportunity  →  Fit Analysis  →  APPLY / MAYBE / SKIP
                                                    ↓
                              Why  →  Gap Analysis  →  Readiness Checklist
                                                    ↓
                                        Official source
```

Fit score is a signal only. It never replaces APPLY / MAYBE / SKIP.

---

## What v0.1 actually does

- **Sign in** — email and password (JWT in `X-Hulum-Session`). Create account at `/verify` (register, not email OTP). Google sign-in uses the same account. **Forgot password** emails a single-use 30-minute link.
- **Onboarding and profile** — new accounts walk a 4-step setup (`/onboarding`); `/profile` is a structured profile (photo, identity, completeness, education, skills, interests, languages), lets you edit it, and keeps a private CV (Upload CV once, then View / Update CV) plus supporting documents. The photo is display-only and never read by the decision engine. No one-click Abeba demo button.
- **Discover** — keyword search and filters over the stored catalog, including your stored decision. It never invents listings.
- **My opportunities and Readiness** — saved listings, past APPLY / MAYBE / SKIP results, and preparation progress (`/my-opportunities`, `/readiness`).
- **Opportunity catalog** — investigator-filled from evidenced pages (not a baked seed list). May be empty until the worker runs.
- **APPLY / MAYBE / SKIP** — one verdict per opportunity or screenshot analyze; fit 0–100 does not override the rules.
- **Screenshot analyze** — `/screenshot` extracts visible facts (Groq vision when keyed) then `decide()` against your profile.
- **Explanation** — engine summary; optional Groq on `POST /api/analyses/:id/explain`. Models never change the decision.
- **Gaps and readiness** — MET / NOT_MET / UNCERTAIN, then a TODO checklist.
- **Official source** — stored `sourceUrl` / `applicationUrl` when present.
- **Ask HULUM** — text and quick prompts on `/assistant`, plus a microphone button after sign-in. The button talks to Voxide only when that key allows the site’s domain. If it cannot connect, type the question. The same engine answers both.
- **Light and dark mode** — follows the OS until you choose.
- **Backup mode** — Voice unavailable keeps typing and the rest of the UI.

Out of v0.1: auto-apply, payments, native mobile, inventing listings, and using ScholarXIV papers as the decision. The footer “Subscribe” box does not store addresses.

---

## Tech stack (as built)

`npm run dev` starts the web on **:3000** and the Express API on **:3001**. The web calls that single API (`NEXT_PUBLIC_API_URL`, default `http://localhost:3001`). The API uses the **Postgres** store and Mulualem’s `decide()` engine by default. A JSON file-store path still exists for tests (`createApp({ store: "file" })`) but is not what `npm run dev` boots.

| Layer | v0.1 | Planned / unused in runtime |
|---|---|---|
| Web | Next.js 15, TypeScript, Tailwind 4 (`:3000`) | — |
| API | Express, TypeScript (`:3001`) | — |
| Store | PostgreSQL via `DATABASE_URL` | JSON file store (tests / optional) |
| Decision | `apps/server/src/decision/decide.ts` | An LLM must not decide |
| Explanation | Groq on stored analyses (`GROQ_API_KEY`, `GROQ_MODEL`) | Claude leftover env names |
| Voice | Ask HULUM text, plus the Voxide microphone when the key allows the site | Amharic/Oromo recognition quality is not a claimed result |
| Research | `docs/research/` and `/research` when a server key is set | The paper log in `scholarxiv.md` stays empty; papers never decide |
| Host | [hulum-alpha.vercel.app](https://hulum-alpha.vercel.app) and [hulum-api.onrender.com](https://hulum-api.onrender.com) | Local `npm run dev` still works |

---

## Repository

```
hulum/
├── apps/web/          # Next.js: /, /onboarding, /opportunities, /opportunities/[id], /my-opportunities, /readiness, /assistant, /profile, /screenshot, /research
├── apps/server/       # Express API (Postgres + JWT auth + investigator worker)
├── packages/shared/   # Zod + Task 22 contracts
├── database/          # Postgres migrations
├── docs/              # Product, research, ADRs, demo script, STARK evidence
└── CHANGELOG.md
```

Judges: start at `docs/stark/README.md` (submission package), then `docs/demo/script.md`.

---

## Run locally

```bash
npm install
copy .env.example .env
npm run db:migrate
npm run dev
```

- Web: http://localhost:3000
- API health: http://localhost:3001/api/health → `{ "data": { "status": "ok" }, "error": null }`

Never put real keys in chat or in Git. `.env.example` is names only.

Set `DATABASE_URL` and `CLIENT_URL=http://localhost:3000` in local `.env` before `npm run dev`. Optional: `SESSION_SECRET` (required in production), `GROQ_API_KEY` + `GROQ_MODEL` for explain / extract / investigator wording (never decides APPLY / MAYBE / SKIP).

`npm test` / `npm run test:server` runs matching, APPLY / MAYBE / SKIP, API flows, and failure cases. `npm run smoke:local` checks health + register + catalog list. `npm run smoke:browser` is the Chromium click-through. `npm run lint` / `npm run format:check` use ESLint and Prettier. GitHub Actions runs typecheck, lint, test, and smokes on push/PR (`.github/workflows/ci.yml`).

API-only: `cp apps/server/.env.example apps/server/.env` then `npm run db:migrate` and `npm run dev:server`.

See `database/README.md` for migrate/smoke. Judge walkthrough: `docs/demo/script.md`.

---

## Shared contracts

Web and server import types from `@hulum/shared`. Task 22 lock notes are in `packages/shared/README.md`. Ask HULUM uses `SHOW_MISSING_REQUIREMENTS` (not `SHOW_GAPS`).

---

## API

```http
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/auth/google
POST   /api/profile
GET    /api/profile/:userId
PATCH  /api/profile/:userId
POST   /api/profile/:userId/documents      # optional replacesId swaps one file in place
GET    /api/profile/:userId/photo
POST   /api/profile/:userId/photo
DELETE /api/profile/:userId/photo
GET    /api/opportunities
GET    /api/opportunities/:id
POST   /api/opportunities/:id/analyze
GET    /api/analyses/:id
POST   /api/analyses/:id/explain
GET    /api/analyses/:id/readiness
PATCH  /api/readiness/:id
POST   /api/ai/screenshot-analyze
POST   /api/voice/session
POST   /api/voice/action
```

Envelope: `{ data, error }`. Browser sends `X-Hulum-Session` (JWT) when signed in. `SESSION_SECRET` is required in production.

Set `CLIENT_URL` in `apps/server/.env` to the web origin (`http://localhost:3000`). The API does not send CORS `*` and does not put secrets in error bodies.

---

## Production configuration

Live hosts: **Vercel** serves the site and **Render** serves the API. Setup notes: `docs/stark/deployment.md`.

| Variable | Required in production | Role |
|---|---|---|
| `NODE_ENV` | yes (`production`) | Disables localhost CORS fallback |
| `CLIENT_URL` | yes (web origin, no path) | CORS allowlist |
| `PORT` | no (default `3001`) | API listen port |
| `NEXT_PUBLIC_API_URL` | web build | Browser → API origin (local `http://localhost:3001`, or the Render URL) |
| `API_PUBLIC_URL` | API, when hosted | Google callback origin. Same Render URL, no path |
| `STORE_PATH` | no | File-store path for tests only |
| `CLAUDE_API_KEY` + `CLAUDE_MODEL` | no | Leftover names; v0.1 explain uses Groq |
| `GROQ_API_KEY` + `GROQ_MODEL` | no | Optional explain of a stored analysis |
| `VOXIDE_API_KEY` | no | Leftover; widget uses public web key |
| `NEXT_PUBLIC_VOXIDE_KEY` | no | Publishable `vox_pub_…` key. The Voxide dashboard must allow the site origin |
| `DATABASE_URL` / `SUPABASE_*` | yes for `npm run dev` | Postgres for the default API |
| `SESSION_SECRET` | yes in production | JWT signing for `X-Hulum-Session` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | no | Optional Google OAuth |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` | no | Password reset email. Links use `CLIENT_URL` + `/reset-password` |

The API refuses to start in production without `CLIENT_URL` and `SESSION_SECRET`.

---

## Opportunity verification

`GET /api/opportunities` returns an **effective** `verificationStatus` (the database row is not rewritten):

- `EXPIRED` if the stored status is expired, or the deadline date is before today (UTC).
- `NEEDS_REVIEW` if a `VERIFIED` row has no `lastVerifiedAt`, a last-verified time older than 30 days, or no `sourceUrl`.
- `sourceUrl` is the eligibility/deadline authority. `applicationUrl` is only where to apply. HULUM analysis is never the official source.

Every new analysis summary includes `OFFICIAL_SOURCE_NOTICE` from `@hulum/shared`.

## Disclaimer

HULUM is a decision aid, not an official eligibility authority. It uses declared profile facts and stored opportunity records. Always confirm requirements and deadlines with the official organization.

---

## Team

**Team Ethiopian Builders** — Kidist (frontend, UX, voice experience) and Mulualem (backend, database, decision engine, infrastructure).
