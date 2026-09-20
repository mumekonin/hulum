# HULUM architecture (v0.1 as built)

Status: accepted for v0.1 (STARK 2026).  
Records: [ADR 001 — stack and providers](../decisions/001-stack-and-providers.md), Kidist ADRs 001–004 under `docs/decisions/`.

HULUM is a **decision-support** product. It is not an official eligibility authority.

There are **two runtimes** in this repository:

```text
Browser (Next.js :3000)
        ↓  REST  { data, error }
Express API (:4000 by default)
        ├── security headers + CORS (CLIENT_URL required in production)
        ├── packages/shared contracts
        ├── decision/  (source of truth for APPLY/MAYBE/SKIP)
        ├── file JSON store  (default `createApp()` / `npm run dev`)
        ├── Postgres routers (`createApp({ store: "postgres" })`)
        ├── Groq explain() on stored Postgres analyses
        ├── optional Claude wording on the file-store analyze path
        └── Voxide            not wired; text intents + backup UI
```

ScholarXIV is **not** on this path. See `docs/research/`.

## Runtime rules

| Concern | Owner | v0.1 fact |
|---|---|---|
| APPLY / MAYBE / SKIP | `decide.ts` and `engine.ts` | Deterministic. No model writes this. |
| Requirement MET / NOT_MET / UNCERTAIN | matcher | Never guess MET. |
| Plain-language “why” | Groq (Postgres) or optional Claude (file store), then guards | Must match the stored decision. |
| Official deadline / eligibility | `sourceUrl` on the opportunity | HULUM analysis is secondary. |
| Voice | Ask HULUM text/quick actions | Voxide widget is planned, not connected. |
| Research trail | ScholarXIV | Not a production opportunity API. |

Shared TypeScript types live in `packages/shared`. Web, mobile, and server must not copy them.

## What is on `main` today

- `apps/web` — Next.js Abeba Tesfaye demo
- `apps/server` — Express, Vitest, `{ data, error }` envelope; file-store default
- `packages/shared` — contracts
- `database/migrations` — PostgreSQL

Do not put Groq or `decide()` in the browser.

## Local ports

| App | Port | CORS |
|---|---|---|
| Web | `3000` | — |
| API | `4000` default (`3001` if set in env) | `CLIENT_URL` (web origin, not the API origin) |

---

## Packages

| Path | Role |
|---|---|
| `apps/web` | Next.js App Router: `/`, `/profile`, `/opportunities`, `/analysis/[id]`, `/assistant` |
| `apps/server` | Express routes, matching, decision, readiness, optional model wording, voice-text |
| `packages/shared` | Profile, Opportunity, Decision, RequirementStatus, Analysis, ReadinessItem, VoiceIntent, Zod schemas |
| `database/migrations/001_init.sql` | Postgres/Supabase schema for when credentials exist |
| `data/store.json` | Local persistence (gitignored) |

Frontend never receives Claude, Groq, or Voxide keys. `NEXT_PUBLIC_API_URL` is the only public env.

## Analyze path (file-store demo)

```text
Profile + Opportunity
        ↓
matchRequirement  →  MET | NOT_MET | UNCERTAIN | NOT_APPLICABLE
        ↓
scoreRequirements  →  0–100 (signal only)
        ↓
decide  →  APPLY | MAYBE | SKIP
        ↓
readiness items
        ↓
optional Claude sentence  (must not change decision)
        ↓
persist analysis
        ↓
UI / voice-text reply
```

The Analyze button and `ANALYZE_OPPORTUNITY` both call `runAnalysis`.

Rules (also in `apps/server/src/decision/engine.ts` and tests):

1. Critical `NOT_MET` → SKIP  
2. Key requirements (country, education, field) all MET, no significant uncertainty, fit ≥ 75 → APPLY  
3. Else → MAYBE  

## Production

`NODE_ENV=production` requires `CLIENT_URL` as an http(s) origin. Missing `CLIENT_URL` does not fall back to localhost CORS. Claude, Groq, and Voxide keys stay optional.

## ADRs

- `docs/decisions/001-stack-and-providers.md`
- `docs/decisions/001-persistence-file-store.md`
- `docs/decisions/002-decision-engine-source-of-truth.md`
- `docs/decisions/003-voice-text-fallback.md`
- `docs/decisions/004-language-english-e2e.md`
