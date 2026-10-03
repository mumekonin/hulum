# HULUM API (as built)

**Base URL (local):** `http://localhost:3001`  
**Envelope:** `{ "data": T | null, "error": { "message": string, "code"?: string } | null }`  
**Default store:** Postgres via `DATABASE_URL` (`createApp()`). File-store is for tests only.

**Auth:** email/password register + login (optional Google OAuth). Session is a JWT in `X-Hulum-Session` (HS256 via `SESSION_SECRET`; required in production). Password-reset email is not implemented.

## Endpoints

| Method | Path | Body / query | Notes |
|---|---|---|---|
| `GET` | `/api/health` | — | `{ status: "ok" }` |
| `POST` | `/api/auth/register` | name, email, password | Creates user; returns JWT session |
| `POST` | `/api/auth/login` | email, password | Returns JWT session |
| `GET` | `/api/auth/google` | — | Starts Google OAuth (needs client id/secret; without them redirects to `/?auth_error=google_unconfigured`) |
| `GET` | `/api/auth/google/callback` | OAuth query | Completes Google login |
| `GET` | `/api/auth/me` | — | Current user from `X-Hulum-Session` |
| `POST` | `/api/profile` | profile fields + name/email | Creates/updates profile for the session user |
| `GET` | `/api/profile/:userId` | — | UUID; session must match when enforced |
| `PATCH` | `/api/profile/:userId` | partial profile | UUID; session must match when enforced |
| `GET` | `/api/opportunities` | `?q=&type=` | Investigator / verified catalog; may be empty |
| `GET` | `/api/opportunities/:id` | — | UUID |
| `POST` | `/api/opportunities/:id/analyze` | `{ "userId" }` | `decide()` + readiness items |
| `GET` | `/api/analyses` | `?opportunityId=` | Session user's latest analysis per opportunity (stored decision, fit score, readiness done/total). Always requires `X-Hulum-Session` |
| `GET` | `/api/analyses/:id` | — | Stored analysis |
| `POST` | `/api/analyses/:id/explain` | `{ "language"? }` | Groq wording only; **rate-limited** |
| `GET` | `/api/analyses/:id/readiness` | — | Checklist for analysis |
| `GET` | `/api/saved` | — | Session user's saved opportunity ids. Always requires `X-Hulum-Session` |
| `POST` | `/api/saved` | `{ "opportunityId" }` | Save (idempotent); 404 if the opportunity is not stored |
| `DELETE` | `/api/saved/:opportunityId` | — | Unsave; 404 if it was not saved |
| `PATCH` | `/api/readiness/:id` | `{ "status" }` | `TODO` / `IN_PROGRESS` / `DONE` / `NOT_REQUIRED` |
| `POST` | `/api/voice/session` | `{ "userId", "language"? }` | Metadata only; provider `text-fallback` until a Voxide key is set |
| `POST` | `/api/voice/action` | `{ "userId", "text", ... }` | Same intents as Ask HULUM text; timed in ops; profile extract proposes only |
| `POST` | `/api/ai/profile-extract` | self-description text | Proposes fields only; never auto-saves |
| `POST` | `/api/ai/screenshot-analyze` | multipart image | Vision extract + `decide()`; does not invent deadline/apply link or catalog rows |
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
- Production requires `SESSION_SECRET` for JWT sessions.
- Error bodies and health/session responses must not include API keys, SQL, or voice transcripts (sessions store no utterance text).
- Postgres connection failures map to `503 DATABASE_UNAVAILABLE` (see `docs/architecture/failure-tests.md`).

## What this is not

- OpenAPI/Swagger UI is not shipped.
- A public production URL is not claimed.
- Password-reset email / OTP is not claimed.
- Live mic demo is not claimed without a keyed `VoxideAskHulum` test; text/quick actions remain the reliable Ask HULUM path.

Related: `docs/architecture/retention.md`, `docs/architecture/data-exposure.md`, `docs/architecture/observability.md`, `docs/architecture/failure-tests.md`.
