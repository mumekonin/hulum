# Data exposure review (v0.1)

**Status:** review against the shipped API and web  
**Date:** 2026-09-25

## What the API returns

| Surface | Exposed | Not exposed |
|---|---|---|
| Health | `{ status: "ok" }` | Env vars, keys, DB URL |
| Auth | User id, email, name, JWT session token | Password hashes, Google client secret, `SESSION_SECRET` |
| Profile | Structured profile fields for the session user | Other users' profiles (no cross-user listing) |
| Opportunities | Catalog fields + effective verification status | Invented listings; empty until investigator/worker fills |
| Analysis | Decision, fit score, summary, requirement statuses/reasons, readiness | Groq raw logs; model must not change `decision` |
| Analysis list (`GET /api/analyses`) | Session user's latest decision per opportunity, opportunity title/org/type/deadline, readiness counts | Other users' analyses; the user comes from the verified JWT, never from a query parameter |
| Saved (`/api/saved`) | Session user's saved opportunity ids and save time | Other users' saves; no decision stored on this table |
| Screenshot analyze | Extracted fields + decision for the upload | Fake deadlines/apply links; does not write public catalog rows |
| Research | ScholarXIV paper search results when a key is set | The `SCHOLARXIV_API_KEY` itself |
| Investigate | Admin summary when secret header matches | The admin secret |
| Voice session | Session id, language, timestamps | Utterance text, audio |
| Errors | Envelope `message` + `code` | Stack traces, SQL, secrets |

## Web client

- Stores `userId` + JWT (`hulum.sessionToken`) and UI language in `localStorage`.
- Sends `X-Hulum-Session` on API calls (`apps/web/src/lib/api.ts`).
- Calls only `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`). Provider keys stay server-side.
- Official `sourceUrl` / `applicationUrl` open in a new tab; HULUM is not the organization.

## Database

- Owned routes require a matching JWT in `X-Hulum-Session` when `SESSION_SECRET` is set (required in production).
- `GET /api/analyses` and `/api/saved` require the JWT even in open local mode, because they carry no user id to compare against.
- New accounts start with `education_level` and `country` null (no placeholder values), so matching reports them UNCERTAIN until the user fills them in.
- Passwords are stored hashed (`password_hash`); Google accounts use `google_sub`.
- RLS policies in `004_rls_owner_policies.sql` scope user tables to `app.current_user_id` for non-owner DB roles; the v0.1 API still connects as table owner (owner bypasses RLS).
- Server uses `DATABASE_URL` / service credentials; never returned to the browser.

## Residual risk (honest)

Without `SESSION_SECRET`, session checks are relaxed for local demo — do not run a public host that way. Password-reset email is not wired; users who forget passwords create a new account or use Google when configured.

Related: `docs/architecture/api.md`, `docs/architecture/retention.md`.
