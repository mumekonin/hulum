# HULUM

**Your AI opportunity decision agent.**

HULUM evaluates scholarships, fellowships, internships, jobs, grants, and competitions against your personal profile and tells you whether to **APPLY**, **MAYBE**, or **SKIP** — then explains why, shows what you're missing, and tells you what to do next.

Built voice-first for Ethiopian students and young professionals, with Amharic, English, and Afaan Oromo support.

---

## Core loop

```
Profile  →  Opportunity  →  Fit Analysis  →  APPLY / MAYBE / SKIP
                                                    ↓
                              Why  →  Gap Analysis  →  Readiness Checklist
```

## Features

- **Voice or text profile intake** — speak naturally in Amharic, English, or Afaan Oromo; the AI extracts structured profile fields.
- **APPLY / MAYBE / SKIP decisions** — one clear verdict per opportunity, with a 0–100 fit score.
- **Plain-language reasoning** — every decision is explained, requirement by requirement, with evidence.
- **Gap analysis** — exactly which requirements are unmet, and how to close them.
- **Readiness checklist** — a document-by-document action plan with a spoken next step.
- **Verified opportunities** — curated from official sources with deadline and verification state.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL + Row-Level Security) |
| Reasoning | Claude API |
| Voice | Voxide (STT / TTS) |
| Research | ScholarXIV Papers API + MCP |
| Deployment | EthioDeploy |

## Repository structure

```
hulum/
├── apps/
│   ├── web/          # Next.js frontend
│   └── server/       # Express API (routes, services, decision, ai, voice)
├── packages/
│   └── shared/       # Shared types, schemas, constants
├── database/         # Migrations, seeds
├── docs/             # Product, research, architecture, decisions, demo
└── scripts/
```

## Getting started (server)

```bash
npm install
cp apps/server/.env.example apps/server/.env
npm run dev:server
```

`GET http://localhost:3001/api/health` should return `{ "data": { "status": "ok" }, "error": null }`.

Do not put real API keys in chat or in committed files. Local `.env` only.

## Getting started (database)

Set `DATABASE_URL` in `apps/server/.env`, then:

```bash
npm run db:migrate
npm run db:smoke
```

Schema details: `database/README.md`.

## Shared contracts

Web, mobile, and server import types from `@hulum/shared` only. See `packages/shared/README.md`.

## API overview

```http
POST   /api/profile
GET    /api/profile/:userId
PATCH  /api/profile/:userId

GET    /api/opportunities
GET    /api/opportunities/:id

POST   /api/opportunities/:id/analyze
GET    /api/analyses/:id
POST   /api/analyses/:id/explain

GET    /api/analyses/:id/readiness
PATCH  /api/readiness/:id

POST   /api/voice/session
POST   /api/voice/action
```

All responses use a consistent `{ data, error }` envelope. The shared analysis contract lives in `packages/shared/types`.

Set `CLIENT_URL` in `apps/server/.env` to the web origin (`http://localhost:3000`). The API does not send CORS `*` and does not put secrets in error bodies. Full login is not required for v0.1; `userId` on analyze is the current caller identity.

## Project status

**v0.1 — MVP in progress.** Built for the STARK Official Hackathon 2026 (September 9 – October 2, 2026).

| Phase | Focus |
|---|---|
| 1 | Foundation — repo, schema, seed opportunities |
| 2 | AI engine — APPLY/MAYBE/SKIP loop, readiness checklist |
| 3 | Voice — Voxide in English, Amharic, Afaan Oromo |
| 4 | Polish — UI, mobile responsiveness, deployment |
| 5 | Demo preparation |

Out of scope for v0.1: direct application submission, payments, native mobile apps, automated scraping of unverified sources.

## Opportunity verification

`GET /api/opportunities` returns an **effective** `verificationStatus` (the database row is not rewritten):

- `EXPIRED` if the stored status is expired, or the deadline date is before today (UTC).
- `NEEDS_REVIEW` if a `VERIFIED` row has no `lastVerifiedAt`, a last-verified time older than 30 days, or no `sourceUrl`.
- `sourceUrl` is the eligibility/deadline authority. `applicationUrl` is only where to apply. HULUM analysis is never the official source.

Every new analysis summary includes `OFFICIAL_SOURCE_NOTICE` from `@hulum/shared`.

## Disclaimer

HULUM is a decision-support tool, not an official eligibility authority. It evaluates user-declared information and does not verify credentials or guarantee acceptance. Always confirm requirements with the official source.

## Team

Built by **Team Ethiopian Builders** — Kidist (frontend, UX, voice experience) and Mulualem (backend, database, decision engine, infrastructure).

