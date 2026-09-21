# HULUM

**Your AI opportunity decision agent.**

HULUM compares a personal profile to a curated opportunity and returns one answer: **APPLY**, **MAYBE**, or **SKIP** — then why, what is missing, and what to prepare. Official organization pages stay the eligibility authority.

The problem we are solving: [docs/product/problem.md](docs/product/problem.md).

Built for Ethiopian students and young professionals (STARK Hackathon 2026). English is the stable v0.1 path. Amharic and Afaan Oromo language codes are stored; live speech is not connected.

---

## Core loop

```
Profile  →  Opportunity  →  Fit Analysis  →  APPLY / MAYBE / SKIP
                                                    ↓
                              Why  →  Gap Analysis  →  Readiness Checklist
                                                    ↓
                                        Official source
```

A TypeScript engine decides APPLY / MAYBE / SKIP. Claude never changes that decision. Fit score is a signal only.

---

## What v0.1 actually does

- **Structured profile** — form plus Abeba Tesfaye demo persona. Not voice-extracted facts.
- **APPLY / MAYBE / SKIP** — one verdict per opportunity; fit 0–100 does not override the rules.
- **Explanation** — engine summary; optional Claude on the file-store demo; Groq on `POST /api/analyses/:id/explain` (Postgres path). Neither model changes the decision.
- **Gaps and readiness** — MET / NOT_MET / UNCERTAIN, then a TODO checklist.
- **Official source** — stored `sourceUrl` / `applicationUrl` on opportunity and analysis screens.
- **Ask HULUM** — text and quick actions (ADR 003). Voxide STT/TTS is not wired.
- **Backup mode** — Voice unavailable keeps typing and the rest of the UI.

Out of v0.1: auto-apply, payments, native mobile, scraping unverified lists, live ScholarXIV in the API.

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
| Voice | Keyword intents + text/quick actions | Voxide browser widget |
| Research | `docs/research/` (design-time) | ScholarXIV Papers API — **no papers retrieved yet** |
| Host | Local `npm run dev` | EthioDeploy / production — **not deployed** |

---

## Repository

```
hulum/
├── apps/web/          # Next.js: /, /profile, /opportunities, /analysis/[id], /assistant
├── apps/server/       # Express API (Postgres default + optional file-store)
├── packages/shared/   # Zod + Task 22 contracts
├── database/          # Postgres migration
├── docs/              # Product, research, ADRs, demo script, STARK evidence
└── CHANGELOG.md
```

Judges: start at `docs/stark/README.md` (submission package), then `docs/demo/script.md`.

---

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

- Web: http://localhost:3000
- API health: http://localhost:3001/api/health → `{ "data": { "status": "ok" }, "error": null }`

Never put real keys in chat or in Git. `.env.example` is names only.

Set `DATABASE_URL` and `CLIENT_URL=http://localhost:3000` in local `.env` before `npm run dev`. Optional: `GROQ_API_KEY` + `GROQ_MODEL` for explanation wording only (never decides APPLY / MAYBE / SKIP).

`npm test` / `npm run test:server` runs matching, APPLY / MAYBE / SKIP, API flows, and failure cases.

API-only: `cp apps/server/.env.example apps/server/.env` then `npm run db:migrate` and `npm run dev:server`.

See `database/README.md` for migrate/smoke.

GitHub Actions (`.github/workflows/ci.yml`) runs install, shared + server typecheck, and tests on push and pull request. Lint, full Next/server build, and deploy are not in the gate yet.

Deployment decision (local only, no EthioDeploy): `docs/stark/deployment.md`.

---

## Shared contracts

Web and server import types from `@hulum/shared`. Task 22 lock notes are in `packages/shared/README.md`. Ask HULUM uses `SHOW_MISSING_REQUIREMENTS` (not `SHOW_GAPS`).

---

## API

```http
GET    /api/health
POST   /api/profile
POST   /api/profile/demo
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

Envelope: `{ data, error }`. Auth is a local `userId` (full login is P1).

Set `CLIENT_URL` in `apps/server/.env` to the web origin (`http://localhost:3000`). The API does not send CORS `*` and does not put secrets in error bodies.

---

## Production configuration

v0.1 is **not deployed**. When a host exists:

| Variable | Required in production | Role |
|---|---|---|
| `NODE_ENV` | yes (`production`) | Disables localhost CORS fallback |
| `CLIENT_URL` | yes (web origin, no path) | CORS allowlist |
| `PORT` | no (default `3001`) | API listen port |
| `NEXT_PUBLIC_API_URL` | web build | Browser → API origin (`http://localhost:3001`) |
| `STORE_PATH` | no | File-store path for tests only |
| `CLAUDE_API_KEY` + `CLAUDE_MODEL` | no | Leftover names; v0.1 explain uses Groq |
| `GROQ_API_KEY` + `GROQ_MODEL` | no | Optional explain of a stored analysis |
| `VOXIDE_API_KEY` | no | Leftover; widget uses public web key |
| `DATABASE_URL` / `SUPABASE_*` | yes for `npm run dev` | Postgres for the default API |

The API refuses to start in production without `CLIENT_URL`.

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
