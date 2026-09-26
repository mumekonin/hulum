# Retention strategy (v0.1)

**Status:** documented for the running local/Postgres product  
**Date:** 2026-09-23

| Data | Retention | Notes |
|---|---|---|
| Profiles, opportunities, analyses, requirement results, readiness | Until deleted from the database | No automated purge job in v0.1 |
| Voice sessions | Session metadata only (`user_id`, `language`, timestamps) | **No audio, no transcript** columns |
| Groq explain calls | Not stored as raw model logs in HULUM | Only the analysis row's summary/decision persists |
| Client `userId` + JWT (`hulum.sessionToken`) in `localStorage` | Browser-local | Sent as `X-Hulum-Session`; not an HttpOnly cookie |

## Principles

1. Do not keep speech audio or utterance text.
2. Do not invent a multi-year compliance program we have not built.
3. When a production host exists, operators should set backup/retention on the Postgres provider explicitly; HULUM does not ship a cron purge yet.

Related: `docs/architecture/api.md`, `docs/architecture/data-exposure.md`, ADR 001 (voice sessions).
