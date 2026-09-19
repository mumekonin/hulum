# HULUM

**Your AI opportunity decision agent.**

HULUM compares a personal profile to a curated opportunity and returns one answer: **APPLY**, **MAYBE**, or **SKIP** — then why, what is missing, and what to prepare. Official organization pages stay the eligibility authority.

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
- **Explanation** — engine summary; optional Claude wording if a key and model are set.
- **Gaps and readiness** — MET / NOT_MET / UNCERTAIN, then a TODO checklist.
- **Official source** — stored `sourceUrl` / `applicationUrl` on opportunity and analysis screens.
- **Ask HULUM** — text and quick actions (ADR 003). Voxide STT/TTS is not wired.
- **Backup mode** — Voice unavailable keeps typing and the rest of the UI.

Out of v0.1: auto-apply, payments, native mobile, scraping unverified lists, live ScholarXIV in the API.

---

## Tech stack (as built)

| Layer | v0.1 | Planned / unused in runtime |
|---|---|---|
| Web | Next.js 15, TypeScript, Tailwind 4 (`:3000`) | — |
| API | Express, TypeScript (`:4000`) | — |
| Store | JSON file (`STORE_PATH`) | Supabase/Postgres + RLS (`001_init.sql`) |
| Decision | `apps/server/src/decision/` | Claude must not decide |
| Explanation | Engine summary; optional Claude | — |
| Voice | Keyword intents + text/quick actions | Voxide STT/TTS |
| Research | `docs/research/` (design-time) | ScholarXIV Papers API — **no papers retrieved yet** |
| Host | Local `npm run dev` | EthioDeploy / production — **not deployed** |

---

## Repository

```
hulum/
├── apps/web/          # Next.js: /, /profile, /opportunities, /analysis/[id], /assistant
├── apps/server/       # Express API, engine, optional Claude, voice-text
├── packages/shared/   # Zod contracts
├── database/          # Postgres migration for later
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
- API health: http://localhost:4000/api/health → `{ "data": { "status": "ok" }, "error": null }`

Never put real keys in chat or in Git. `.env.example` is names only.

The engine runs with empty Claude/Voxide keys. Set `CLAUDE_API_KEY` (or `ANTHROPIC_API_KEY`) **and** `CLAUDE_MODEL` only if you want LLM wording on top of the structured decision.

`npm test` runs matching, APPLY / MAYBE / SKIP, API flows, and failure cases.

API-only: `cp apps/server/.env.example apps/server/.env` then `npm run dev:server`.

Postgres schema exists (`npm run db:migrate` / `npm run db:smoke` when `DATABASE_URL` is set). The API still uses the file store until that switch is wired. See `database/README.md`.

---

## Shared contracts

Web and server import types from `@hulum/shared`. Task 22 lock notes are in `packages/shared/README.md`. The running voice parser still uses `SHOW_GAPS`; Mulualem’s lock names that intent `SHOW_MISSING_REQUIREMENTS`.

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
GET    /api/analyses/:id/readiness
PATCH  /api/readiness/:id
POST   /api/voice/session
POST   /api/voice/action
```

Envelope: `{ data, error }`. Auth is a local `userId` (full login is P1).

---

## Production configuration

v0.1 is **not deployed**. When a host exists:

| Variable | Required in production | Role |
|---|---|---|
| `NODE_ENV` | yes (`production`) | Disables localhost CORS fallback |
| `CLIENT_URL` | yes (web origin, no path) | CORS allowlist |
| `PORT` | no (default `4000`) | API listen port |
| `NEXT_PUBLIC_API_URL` | web build | Browser → API origin |
| `STORE_PATH` | no | File-store path (gitignored) |
| `CLAUDE_API_KEY` + `CLAUDE_MODEL` | no | Optional explanation wording |
| `VOXIDE_API_KEY` | no | Not wired |
| `DATABASE_URL` / `SUPABASE_*` | no | Unused until the store switches |

The API refuses to start in production without `CLIENT_URL`.

---

## Disclaimer

HULUM is a decision aid, not an official eligibility authority. It uses declared profile facts and stored opportunity records. Always confirm requirements and deadlines with the official organization.

---

## Team

**Team Ethiopian Builders** — Kidist (frontend, UX, voice experience) and Mulualem (backend, database, decision engine, infrastructure).
