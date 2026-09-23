# HULUM API (as built)

**Base URL (local):** `http://localhost:3001`  
**Envelope:** `{ "data": T | null, "error": { "message": string, "code"?: string } | null }`  
**Default store:** Postgres via `DATABASE_URL` (`createApp()`). File-store is for tests only.

Auth is a client-supplied `userId` (UUID). Full login is P1 and not implemented.

## Endpoints

| Method | Path | Body / query | Notes |
|---|---|---|---|
| `GET` | `/api/health` | — | `{ status: "ok" }` |
| `POST` | `/api/profile` | profile fields + name/email | Creates user + profile |
| `GET` | `/api/profile/:userId` | — | UUID required |
| `PATCH` | `/api/profile/:userId` | partial profile | UUID required |
| `GET` | `/api/opportunities` | `?q=&type=` | Effective verification status on read |
| `GET` | `/api/opportunities/:id` | — | UUID |
| `POST` | `/api/opportunities/:id/analyze` | `{ "userId" }` | `decide()` + readiness items |
| `GET` | `/api/analyses/:id` | — | Stored analysis |
| `POST` | `/api/analyses/:id/explain` | `{ "language"? }` | Groq wording only; **rate-limited** |
| `GET` | `/api/analyses/:id/readiness` | — | Checklist for analysis |
| `PATCH` | `/api/readiness/:id` | `{ "status" }` | `TODO` / `IN_PROGRESS` / `DONE` / `NOT_REQUIRED` |
| `POST` | `/api/voice/session` | `{ "userId", "language"? }` | Metadata only; provider `text-fallback` until a Voxide key is set |
| `POST` | `/api/voice/action` | `{ "userId", "text", ... }` | Same intents as Ask HULUM text; timed in ops; profile extract proposes only |
| `POST` | `/api/ai/profile-extract` | self-description text | Proposes fields only; never auto-saves |
| `GET` | `/api/ops/summary` | — | In-process latency/error aggregates (no profile/transcript payloads) |
| `POST` | `/api/ops/decision-debug` | `{ "userId", "opportunityId" }` | Re-runs `decide()` for debug; not a user guarantee |
| `POST` | `/api/ops/client-event` | `{ "code", "kind?", "name?" }` | Whitelist voice failure codes only |
| `GET` | `/api/research/papers` | `?q=` | ScholarXIV Papers API proxy; needs `SCHOLARXIV_API_KEY` |
| `POST` | `/api/investigate` | — | Admin investigator; needs `x-hulum-investigate` + `INVESTIGATE_ADMIN_SECRET` |

## Validation

- Shared Zod schemas (`@hulum/shared`) and server parsers reject invalid bodies with `4xx` + envelope `error`.
- Profile create/patch, analyze, readiness patch, and voice action are validated before services run.
- Opportunity ids and user ids on Postgres routes must be UUIDs.
- Groq explanation text is guarded; unsafe output is replaced with the stored summary (decision unchanged).

## Rate limiting

- `POST /api/analyses/:id/explain` and profile-extract: rate-limited per client IP (see env).
- Other routes are not rate-limited in v0.1.

## CORS and secrets

- Production requires `CLIENT_URL` (web origin). No `Access-Control-Allow-Origin: *`.
- Error bodies and health/session responses must not include API keys, SQL, or voice transcripts (sessions store no utterance text).

## What this is not

- OpenAPI/Swagger UI is not shipped.
- JWT auth and a public production URL are not claimed.
- Live mic demo is not claimed without a keyed `VoxideAskHulum` test; text/quick actions remain the reliable Ask HULUM path.

Related: `docs/architecture/retention.md`, `docs/architecture/data-exposure.md`, `docs/architecture/observability.md`.
