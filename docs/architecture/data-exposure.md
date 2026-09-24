# Data exposure review (v0.1)

**Status:** review against the shipped API and web  
**Date:** 2026-09-23

## What the API returns

| Surface | Exposed | Not exposed |
|---|---|---|
| Health | `{ status: "ok" }` | Env vars, keys, DB URL |
| Profile | Structured profile fields for the requested `userId` | Other users' profiles (no cross-user listing) |
| Opportunities | Curated catalog fields + effective verification status | Scraped or invented listings |
| Analysis | Decision, fit score, summary, requirement statuses/reasons, readiness | Groq raw logs; model must not change `decision` |
| Research | ScholarXIV paper search results when a key is set | The `SCHOLARXIV_API_KEY` itself |
| Investigate | Admin summary when secret header matches | The admin secret |
| Voice session | Session id, language, timestamps | Utterance text, audio |
| Errors | Envelope `message` + `code` | Stack traces, SQL, secrets |

## Web client

- Stores `userId` / language in `localStorage` for demo continuity.
- Calls only `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`). Provider keys stay server-side.
- Official `sourceUrl` / `applicationUrl` open in a new tab; HULUM is not the organization.

## Database

- Access is by known `userId` UUID on routes. When `SESSION_SECRET` is set (required in production), owned routes also require a matching `X-Hulum-Session` HMAC token issued on profile create/load.
- RLS policies in `004_rls_owner_policies.sql` scope user tables to `app.current_user_id` for non-owner DB roles; the v0.1 API still connects as table owner (owner bypasses RLS).
- Server uses `DATABASE_URL` / service credentials; never returned to the browser.

## Residual risk (honest)

Without `SESSION_SECRET`, anyone who knows a profile `userId` UUID can call profile/analysis routes (local demo mode). Set `SESSION_SECRET` before any public host.

Related: `docs/architecture/api.md`, `docs/architecture/retention.md`.
