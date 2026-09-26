# HULUM architecture (v0.1 as built)

Status: accepted for v0.1 (STARK 2026).  
Records: [ADR 001 — stack and providers](../decisions/001-stack-and-providers.md), Kidist ADRs 001–004 under `docs/decisions/`.

HULUM is a **decision-support** product. It is not an official eligibility authority.

**Dev runtime (one path):** `npm run dev` serves the Next.js web on **port 3000** and the Express API on **port 3001**. The web talks only to that API (`NEXT_PUBLIC_API_URL`, default `http://localhost:3001`). The API boots the **Postgres** store (`createApp({ store: "postgres" })`) and APPLY / MAYBE / SKIP come only from `apps/server/src/decision/decide.ts`. Groq may explain a stored analysis; it never decides.

```text
Browser (Next.js :3000)
        ↓  REST  { data, error }  →  http://localhost:3001
Express API (:3001)
        ├── JWT auth (`/api/auth/*`, `X-Hulum-Session`)
        ├── security headers + CORS (CLIENT_URL required in production)
        ├── packages/shared contracts
        ├── decide() + requirements/match  (APPLY / MAYBE / SKIP)
        ├── PostgreSQL (DATABASE_URL) + investigator worker
        ├── Groq explain() / screenshot vision on stored or uploaded evidence only
        └── Voxide            optional widget; text intents remain the reliable path
```

A JSON file-store router (`createApp({ store: "file" })` + `decision/engine.ts`) remains for existing file-store tests. It is **not** what `npm run dev` starts.

ScholarXIV is **not** on this path. See `docs/research/`.

## Runtime rules

| Concern | Owner | v0.1 fact |
|---|---|---|
| Auth / session | `apps/server/src/auth/`, `security/session.ts` | Email/password JWT (+ optional Google); `SESSION_SECRET` required in production. Password-reset email not wired. |
| APPLY / MAYBE / SKIP | `apps/server/src/decision/decide.ts` | Deterministic. No model writes this. |
| Requirement MET / NOT_MET / UNCERTAIN | `requirements/match.ts` | Never guess MET. |
| Plain-language “why” | Groq, then guards | Must match the stored decision. |
| Official deadline / eligibility | `sourceUrl` on the opportunity | HULUM analysis is secondary. |
| Catalog | Investigator + verification | No baked `db:seed` opportunity cards. |
| Voice | Ask HULUM text/quick actions + optional `VoxideAskHulum` | Widget needs `NEXT_PUBLIC_VOXIDE_KEY`; Postgres `/api/voice/*` call `decide()`. |
| Research trail | ScholarXIV `/research` + Papers API | Not a production opportunity API; does not set APPLY / MAYBE / SKIP. |

Shared TypeScript types live in `packages/shared`. Web, mobile, and server must not copy them.

## Related docs

| Doc | Topic |
|---|---|
| `docs/architecture/api.md` | Endpoints, Zod validation, explain rate limit |
| `docs/architecture/retention.md` | What is kept; no audio/transcripts |
| `docs/architecture/data-exposure.md` | Honest API/web/DB exposure review |
| `docs/architecture/manual-verification.md` | Catalog verification checklist |
| `docs/product/opportunity-verification.md` | Manual verify + stale rules |
| `docs/stark/deployment.md` | Local-only deploy decision |

## What is on `main` today

- `apps/web` — Next.js site (JWT Create account / Sign in, profile, opportunities, screenshot, Ask HULUM)
- `apps/server` — Express, Vitest, `{ data, error }` envelope; Postgres default; auth + investigator
- `packages/shared` — contracts
- `database/migrations` — PostgreSQL through current migrations (seed closed)

Do not put Groq or `decide()` in the browser.

## Local ports

| App | Port | CORS |
|---|---|---|
| Web | `3000` | Voxide domain whitelist when wired |
| API | `3001` | `CLIENT_URL` (web origin, not the API origin) |

---

## Packages

| Path | Role |
|---|---|
| `apps/web` | Next.js App Router: auth gateway, `/profile`, `/opportunities`, `/analysis/[id]`, `/assistant`, `/screenshot` |
| `apps/server` | Express routes, matching, decision, readiness, optional model wording, voice-text |
| `packages/shared` | Profile, Opportunity, Decision, RequirementStatus, Analysis, ReadinessItem, VoiceIntent, Zod schemas |
| `database/migrations/001_init.sql` | Postgres/Supabase schema for when credentials exist |
| `data/store.json` | Local persistence (gitignored) |

Frontend never receives Claude, Groq, or Voxide keys. `NEXT_PUBLIC_API_URL` is the only public env.

## Analyze path (`npm run dev` / Postgres)

```text
Profile + Opportunity
        ↓
requirements/match.ts  →  MET | NOT_MET | UNCERTAIN | NOT_APPLICABLE
        ↓
decide()  →  APPLY | MAYBE | SKIP
        ↓
readiness items
        ↓
optional Groq explanation  (must not change decision)
        ↓
persist analysis in Postgres
        ↓
UI / voice-text reply
```

Product analyze uses `analysis/service.ts` → `decide.ts`. File-store tests still call `runAnalysis` / `engine.ts` via `createApp({ store: "file" })`.

## Production

`NODE_ENV=production` requires `CLIENT_URL` as an http(s) origin. Missing `CLIENT_URL` does not fall back to localhost CORS. Groq and Voxide keys stay optional.

## ADRs

- `docs/decisions/001-stack-and-providers.md`
- `docs/decisions/001-persistence-file-store.md`
- `docs/decisions/002-decision-engine-source-of-truth.md`
- `docs/decisions/003-voice-text-fallback.md`
- `docs/decisions/004-language-english-e2e.md`
