# Task status (Day 20)

**Date:** 2026-09-19  
**Files:** `task.md`, `HULUM_task.md`  
**Rule:** mark what the running product and tests already do. Do not mark Voxide STT, a production host, ScholarXIV papers, or a browser/device pass that was not run.

This pass does not add product features.

---

## Marked done (were stale `[ ]`)

Built in earlier `feat/*` work, including Mulualem’s schema on `main`:

- Backend scaffold; profile fields and create/edit/persist; matching uses the profile
- Opportunity schema, seeds, source/application URLs, verification timestamps
- Requirement matcher, APPLY/MAYBE/SKIP, fit as a signal, engine tests
- Readiness schema, checklist, TODO/IN_PROGRESS/DONE/NOT_REQUIRED, PATCH
- Express services for profile, opportunity, matching, decision, readiness, Claude explain, voice-text
- Shared Zod contracts
- Frontend search/filter, loading/empty/error, accessibility
- API tests: explanation after decision, frontend talks to API, file-store persist
- Postgres `001_init.sql` + `db:migrate` / `db:smoke` (API still reads the JSON file store)
- Filter-by-decision in Ask HULUM
- Days 8–9 integration tests (analysis → readiness)

MVP loop checkboxes that already work locally: profile, catalog, matching, decision, explanation, gaps, readiness. English + official source + fallback stay marked as before.

---

## Left open on purpose

| Item | Why |
|---|---|
| ScholarXIV papers / Research evidence | No Papers API or MCP run |
| Voxide STT/TTS, microphone, Amharic/Oromo speech | Unwired (ADR 003 / 004) |
| Deploy / production test / EthioDeploy | No host |
| Browser/device testing | Not run in this pass |
| Database connection in the live API | Schema exists; runtime is still `STORE_PATH` |
| Claude readiness-plan generation | Engine builds the checklist; Claude does not |
| Profile extract by voice | Out of v0.1 |
| Auth / CI / lint-format | P1, not this freeze |
| Backup video/screenshots | Not captured |

Voice interaction on the frontend stays `[-]` (text/quick actions, not a microphone).

---

## Day 20 freeze

- No new product features in this commit.
- Final task status is this file plus the checkbox updates.
- Git history review: `docs/stark/git-history.md`.
- Final changelog, demo rehearsal, and STARK package remain separate.
