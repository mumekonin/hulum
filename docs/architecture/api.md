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
| `POST` | `/api/profile/demo` | — | Loads Abeba demo profile |
| `GET` | `/api/profile/:userId` | — | UUID required |
| `PATCH` | `/api/profile/:userId` | partial profile | UUID required |
| `GET` | `/api/opportunities` | `?q=&type=` | Effective verification status on read |
| `GET` | `/api/opportunities/:id` | — | UUID |
| `POST` | `/api/opportunities/:id/analyze` | `{ "userId" }` | `decide()` + readiness items |
| `GET` | `/api/analyses/:id` | — | Stored analysis |
| `POST` | `/api/analyses/:id/explain` | `{ "language"? }` | Groq wording only; **rate-limited** |
| `GET` | `/api/analyses/:id/readiness` | — | Checklist for analysis |
| `PATCH` | `/api/readiness/:id` | `{ "status" }` | `TODO` / `IN_PROGRESS` / `DONE` / `NOT_REQUIRED` |
| `POST` | `/api/voice/session` | `{ "userId", "language"? }` | Metadata only; provider `text-fallback` |
| `POST` | `/api/voice/action` | `{ "userId", "text", ... }` | Same intents as Ask HULUM text |

## Validation

- Shared Zod schemas (`@hulum/shared`) and server parsers reject invalid bodies with `4xx` + envelope `error`.
- Profile create/patch, analyze, readiness patch, and voice action are validated before services run.
- Opportunity ids and user ids on Postgres routes must be UUIDs.
- Groq/Claude explanation text is guarded; unsafe output is replaced with the stored summary (decision unchanged).

## Rate limiting

- `POST /api/analyses/:id/explain`: **10 requests / 60 seconds / client IP** (`EXPLAIN_RATE_LIMIT_MAX` / `EXPLAIN_RATE_LIMIT_WINDOW_MS`).
- Other routes are not rate-limited in v0.1.

## CORS and secrets

- Production requires `CLIENT_URL` (web origin). No `Access-Control-Allow-Origin: *`.
- Error bodies and health/session responses must not include API keys, SQL, or voice transcripts (sessions store no utterance text).

## What this is not

- OpenAPI/Swagger UI is not shipped.
- JWT auth, RLS enforcement in the app layer, and a public production URL are not claimed.
- Voxide STT is optional on the web; the API voice routes are text/quick-action capable without a mic.
