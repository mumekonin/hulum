# Changelog

HULUM records actual work. Do not invent history.

## 2026-09-23 — Milestone git tags

### Added
- Annotated `milestone/*` tags on real commits (`foundation-web-api`, `vertical-slice`, `ci-build-gates`, `postgres-ask-hulum`, `v0.1-local`).
- `docs/stark/milestones.md` lists tag → SHA → what each marks (local-only; not a production release).

### Why
Phase 27 P1 asked for milestone tags without manufacturing SemVer product releases or rewriting history.

## 2026-09-23 — Voice profile extract (propose only)

### Added
- Voice intent `UPDATE_PROFILE` + `replyHint: profile_extract` for utterances like “Extract profile from this: …”.
- Postgres and file-store voice handlers call `proposeProfileExtract` and reply with proposed fields; nothing is persisted until the user confirms on Profile.
- `stripProfileExtractDescription` strips the request prefix before Groq sees the self-description.

### Why
Phase 12 P1 asked to create/update profile by voice without silently writing stored facts — reuse the existing propose → confirm → save path from Phase 5.

## 2026-09-23 — Deployment guide and ops API docs

### Added
- `docs/stark/deployment.md` expanded as the Phase 26 deployment guide (local-only decision; no fake deploy job).
- Ops audit/debug routes documented in `docs/architecture/api.md` (`/api/ops/summary`, decision-debug, client-event).

### Fixed
- `docs/demo/backup.md` health URL uses `:3001` (not `:4000`).

### Why
Phase 14 audit/debug, Phase 24 “deployment workflow if appropriate”, and Phase 26 deployment guide asked for honest docs against the shipped local stack — without inventing EthioDeploy or branch protection.

## 2026-09-23 — Voice latency and recognition ops signals

### Added
- `timeOps` on Postgres `POST /api/voice/session` and `/api/voice/action`.
- `POST /api/ops/client-event` whitelist for `VOICE_RECOGNITION_FAILED` / `VOICE_SESSION_ERROR` / `VOICE_SILENCE_TIMEOUT` (no transcripts).
- `VoxideAskHulum` reports those codes when the widget errors, session fails, or silence times out.

### Why
Phase 22 asked for voice latency, recognition failures, and session failures without logging utterance text.

## 2026-09-23 — Voxide language support verified from public docs

### Added
- `docs/research/voxide-languages.md`: public Voxide docs do not list Amharic/Oromo; English stays the only stable end-to-end claim (ADR 004).

### Why
Phase 13 P0 asked to verify Voxide supported languages before adding a second language. Inventing a matrix would break STARK evidence rules.

## 2026-09-21 — Postgres Ask HULUM voice routes

### Added
- Postgres `/api/voice/session` and `/api/voice/action` use `decide()` / analysis services (text fallback works on `npm run dev`).
- `docs/research/voxide-integration.md` notes the browser-widget development path (ADR 001).

### Why
After switching the default store to Postgres, Ask HULUM had an empty voice router. Browser Voxide UI on `/assistant` already ships as `VoxideAskHulum` (see below); this slice wires the server voice actions.

## 2026-09-23 — AI profile extract with confirmation

### Added
- `POST /api/ai/profile-extract` — Groq proposes profile fields from a self-description; never auto-saves.
- Profile page “Propose profile fields” → Confirm into form → Save (existing create/patch).
- Ask HULUM text action for extract proposals (confirmation still on Profile).

### Why
Phase 5 P1s asked for AI profile extraction with an explicit confirmation step before stored facts change.

## 2026-09-23 — API, retention, verification, and deployment docs

### Added
- `docs/architecture/api.md` — endpoints (including research/investigate), Zod validation, explain rate limit, CORS/secrets.
- `docs/architecture/retention.md` — what is kept; no audio/transcripts; no purge cron yet.
- `docs/architecture/data-exposure.md` — honest review of API/web/DB exposure (UUID `userId` demo risk).
- `docs/architecture/manual-verification.md` and `docs/product/opportunity-verification.md` — teammate catalog verification + 30-day stale rules.
- `docs/stark/deployment.md` — local-only deploy decision; EthioDeploy not used.

### Why
Phase 14–16, 23, and security P1s asked for documentation of validation, rate limits, retention, data exposure, verification, and deployment against the shipped Postgres API — without inventing OpenAPI, a public URL, or a purge job.

## 2026-09-23 — Voxide study, ScholarXIV MCP note, import decision

### Added
- `docs/research/voxide-integration.md`: browser `@voxide/react` widget requirements; no install claim on `main`, no mic claim.
- `docs/architecture/opportunity-import.md`: curated catalog only; bulk import not required for v0.1.

### Changed
- `docs/research/scholarxiv.md`: MCP exploration closed; Papers API remains the research path (not Analyze).

### Why
Phase 2 explore P1s and Phase 12 study P0 asked for honest research notes. Empty ScholarXIV rows and an unwired Voxide widget on `main` stay accurate for judges.

## 2026-09-23 — In-process latency and error tracking

### Added
- `apps/server/src/ops/`: rolling API/AI/decision metrics (no profile text or transcripts).
- `GET /api/ops/summary` and `POST /api/ops/decision-debug`.
- `docs/architecture/observability.md`.

### Why
Phase 10/22 asked to track latency and errors without a production metrics vendor or logging sensitive content.

## 2026-09-23 — Kidist: Voxide widget on Ask HULUM

### Added
- `@voxide/react` on `/assistant` behind `NEXT_PUBLIC_VOXIDE_KEY` (`vox_pub_…`).
- One browser tool `runHulumAction` that calls the same `runTextAction` path as typed text and quick actions.
- Text/quick-action fallback StatusPanel when the public key is missing or invalid.
- Widget `setFallback`, `error`, and silence/timeout recovery that nudges back to typed Ask HULUM (same APIs).

### Why
ADR 001: Voxide is a browser widget. Gemini must not invent APPLY / MAYBE / SKIP; `decide()` stays on the server. No Express STT/TTS. Phase 12 asked for recognition failure and silence handling without killing the demo.

### Decision
Live Amharic STT is not claimed. English remains the stable path. Do not mark full voice DONE without a real mic test with a keyed widget.

## 2026-09-23 — CI: force-install Linux Tailwind Oxide after npm ci

### Fixed
- After `npm ci --include=optional`, CI explicitly installs `@tailwindcss/oxide-linux-x64-gnu@4.3.3` (and Lightning CSS / Rollup Linux bindings) so Ubuntu runners get the native packages even when npm’s os/cpu/libc filter skips them.
- Verify step asserts the Oxide and Lightning CSS Linux package directories exist before `require()`.
- `@hulum/web` lists the same Linux Oxide / Lightning CSS packages under `optionalDependencies`.

### Why
Lockfile and root `optionalDependencies` already recorded Oxide Linux, but Build web still failed with `Cannot find native binding` — optional install alone was not enough on the runner.

## 2026-09-23 — CI: record Linux Tailwind Oxide optional dependency

### Fixed
- Root `optionalDependencies` includes `@tailwindcss/oxide-linux-x64-gnu@4.3.3` so Ubuntu `npm ci --include=optional` can load `@tailwindcss/oxide` during `next build`.
- Pin `@tailwindcss/postcss` / `tailwindcss` to `4.3.3` in `apps/web`.
- CI verifies `require('@tailwindcss/oxide')` alongside Lightning CSS before Build web.

### Why
`next/font` triggers Tailwind v4 Oxide. The lockfile only recorded the Windows Oxide binary, so Build web failed after Lightning CSS was fixed.

## 2026-09-23 — CI: record Linux Lightning CSS optional dependency

### Fixed
- Root `optionalDependencies` includes `lightningcss-linux-x64-gnu@1.32.0` so Ubuntu `npm ci --include=optional` can load Tailwind’s Lightning CSS native binary during `next build`.
- CI verifies `require('lightningcss')` before the web build.

### Why
`next/font` + Tailwind need `lightningcss.linux-x64-gnu.node`. The lockfile was Windows-generated and only recorded `lightningcss-win32-*`, so Build web failed after typecheck/tests passed.

## 2026-09-23 — CI builds web and server

### Added
- GitHub Actions runs `npm run build:server` (`tsc`) and `npm run build` (Next.js) after tests.

### Why
Phase 24 asked for frontend and backend build gates. Typecheck alone does not prove `next build` or emit server JS.

## 2026-09-23 — Kidist: Ask HULUM profile gaps, clarify, repeat

### Added
- Text actions for profile completeness gaps and UNCERTAIN requirement clarification (stored analysis only).
- Assistant quick actions plus “Repeat that” / “ድገም” re-shows the last on-screen HULUM reply (no utterance storage).

### Why
Phase 12/18 asked for profile-gap and clarification asks, and repeat requests, without expanding the Task 22 intent enum or inventing requirements.

## 2026-09-23 — Explain evaluation fixtures and Groq retry

### Added
- `apps/server/src/ai/eval-examples.ts`: safe/unsafe Groq explanation fixtures checked against `sanitizeExplanation`.
- One `AI_ERROR` retry in `explain()` before falling back to the stored summary + next action.

### Why
Phase 10 asked for evaluation examples and retry/fallback. Unsafe model text must not change APPLY / MAYBE / SKIP or invent URLs.

## 2026-09-23 — Personalized readiness plan (AI wording)

### Added
- `POST /api/analyses/:id/readiness/plan` — Groq wording over the stored checklist; unsafe or inventing plans fall back to deterministic titles.
- Shared `ReadinessPlan` type; Ask HULUM text action and assistant quick action for personalized plans.
- Rate limit on readiness-plan posts (same limiter as explain).

### Why
Phase 10/11 asked for AI-personalized readiness without letting the model invent checklist items or change APPLY / MAYBE / SKIP.

## 2026-09-23 — Ask about profile gaps and uncertain requirements

### Added
- Ask HULUM (text + file-store voice) answers “What is missing from my profile?” using `profileCompleteness` without writing profile facts.
- “Clarify uncertain requirements” lists UNCERTAIN rows only and tells the user to confirm on the official source.
- Quick actions on `/assistant` for both prompts.

### Why
Phase 18 P1s asked for profile-gap and clarification asks. Reuses locked `UPDATE_PROFILE` / `SHOW_MISSING_REQUIREMENTS` with reply hints so the Task 22 intent set stays closed.

## 2026-09-23 — Requirement explanations in the analysis UI

### Changed
- Analysis requirement rows show a clear **Why** line (matcher `reason`) and **Evidence** when stored.

### Why
Phase 8 asked for requirement explanations. Matchers already produce `reason`; the analysis screen now surfaces them for users.

## 2026-09-23 — CI: Postgres service for vertical-slice tests

### Changed
- `.github/workflows/ci.yml` runs Postgres 16 (`hulum_test`), sets ephemeral job-level `DATABASE_URL`, migrates right after install, then typecheck/lint/`npm test`.
- `loadEnv` no longer overrides existing process env with `.env`, so the CI `DATABASE_URL` is not wiped when `apps/server/.env` is absent or empty.

### Why
`postgres-slice.test.ts` calls `getPool()` / `requireDatabaseUrl()` and needs a live schema. CI had neither Postgres nor `DATABASE_URL`. Credentials are workflow-only disposable values — not committed to `.env`.

## 2026-09-23 — CI: record Linux Rollup optional dependency

### Fixed
- `package-lock.json` now includes `@rollup/rollup-linux-x64-gnu` so Ubuntu `npm ci` / Vitest can resolve Rollup’s native binary.
- CI install uses `npm ci --include=optional`.

### Why
The lockfile was generated on Windows and only recorded `rollup-win32-*`. Job failure was missing `@rollup/rollup-linux-x64-gnu`, not a failing test assertion.

## 2026-09-23 — Lint, format tooling, and GitHub CI

### Added
- Flat ESLint (`eslint.config.mjs`) and Prettier (`.prettierrc.json`) with `npm run lint` / `format` / `format:check`.
- `.github/workflows/ci.yml` — install, typecheck shared/server, lint, test (no deploy, no format gate yet).

### Why
Phase 1 asked for linting, formatting, and CI checks. Format check stays a local script until a dedicated format pass; CI must not fail the whole tree on Prettier alone.

## 2026-09-23 — Decision audit trail

### Added
- `DecisionAudit` on `decide()` (`rulePath`, critical/uncertain keys, effective verification, advisory fit flag).
- Migration `003_analysis_decision_audit.sql` stores audit JSON on `analyses.decision_audit`.
- Analysis page “Decision audit (debug)” panel when audit is present.

### Why
Phase 9 asked for decision audit/debug information. Judges and teammates can see which engine branch produced APPLY / MAYBE / SKIP without treating fit score as a guarantee.

## 2026-09-23 — Conflicting facts stay UNCERTAIN on Postgres matcher

### Changed
- `requirements/match.ts` (Postgres / `decide()` path) now matches file-store conflict rules: field vs skills, years vs “no experience” text, in-progress education with a past graduation year → UNCERTAIN, not MET.

### Why
Phase 8 conflict handling must apply on both matchers. File-store already did; product analysis uses this matcher.

## 2026-09-22 — Mulualem

### Changed
Wired ScholarXIV Papers API to the website: `GET /api/research/papers` and `/research`. The server uses `SCHOLARXIV_API_KEY`. Papers stay research evidence.

### Why
Task 40 P1. Judges can search real papers without putting the key in the browser.

### Decision
ScholarXIV is not an opportunity source. `decide()` is unchanged.

## 2026-09-22 — Mulualem

### Changed
`npm run db:seed` loads the existing curated catalog into Postgres so the web can show official sourced cards (including one internship) while the investigator still refuses to invent rows.

### Why
HETRIIL internship HTML has no public deadline. The frontend was empty.

### Decision
Curated catalog and investigator stay separate. Investigator still does not invent listings.

## 2026-09-22 — Mulualem

### Changed
Investigator extract follow-up: Groq `gpt-oss` calls use `reasoning_effort=low` and a larger completion budget so extract is not cut off mid-thought. Official HTML may follow a few same-domain listing links. Invalid JSON extract becomes zero rows, not a hard fail.

### Why
A live run checked four pages and saved zero rows. Groq returned empty or unavailable replies. HETRIIL listings are not on the homepage.

### Decision
Still no invented listings. Aggregators stay leads. `hetriil.moe.gov.et` stays the official domain.

## 2026-09-22 — Mulualem

### Changed
Closed Task 48. Evidence and official-domain rules are tested. The opportunity card shows “AI-extracted, not yet verified”. Job API still waits for a documented URL.

### Why
Finish the investigator on Mulualem’s side without blocking on Kidist.

## 2026-09-22 — Mulualem

### Changed
Started Task 48: `sources` and `official_domains` tables, demo lead sites, `JOB_OPPORTUNITIES_API_KEY` / `JOB_OPPORTUNITIES_API_URL` names, and `POST /api/investigate`. Groq extracts; evidence must appear on the page. The job API is not called until its URL is documented.

### Why
The team locked automatic discovery. Developers add a source row instead of hardcoding sites.

### Decision
Aggregator hosts stay leads. `hetriil.moe.gov.et` is the first official domain. `decide()` still owns APPLY / MAYBE / SKIP.

## 2026-09-22 — Mulualem

### Changed
Marked Task 36 DONE. The Postgres slice test, web profile/analysis/Ask HULUM path, and Next.js `.js` resolve are already on `main`.

### Why
The integration verify is the real API plus persisted data, not the file-store flow test.

### Evidence
`apps/server/src/routes/postgres-slice.test.ts` on `main`. Web calls that API (PR merge `848fe27`). Next.js loads `@hulum/shared` (PR #18). Voice stays text.

### Decision
No Voxide backend. Task 32 stays skipped.

## 2026-09-20 — Conflicting profile facts stay UNCERTAIN

### Changed
- File-store matcher no longer treats mixed signals as MET: field of study vs skills/interests, years vs “no experience” text, and in-progress education with a past graduation year.

### Why
Phase 8 required handling conflicting information. Guessing MET from one fact while another fact contradicts it would hide a MAYBE.

## 2026-09-21 — Mulualem

### Changed
Pointed the web profile, opportunity list, analysis, and Ask HULUM screens at the Postgres API. Text actions call analyze, explain, readiness, and opportunity reads. Voice stays unavailable.

### Why
The UI still spoke the file-store shapes after `npm run dev` switched to Postgres.

## 2026-09-21 — Mulualem

### Changed
Added a Postgres integration test for profile → opportunity → `decide()` → readiness, and checked that explain does not change the stored decision.

### Why
Task 36 asks the core slice to use real services and persisted data. The older flow test still uses the JSON file store.

### Evidence
`apps/server/src/routes/postgres-slice.test.ts` passed against the local database. The fixture opportunity is deleted after the test.

### Decision
Voice stays a browser widget. This test does not add a Voxide backend.

## 2026-09-21 — Shared exports and Postgres dev runtime

### Changed
- `@hulum/shared` relative imports use `.js` so `typecheck:shared` passes under NodeNext.
- `npm run dev` boots Postgres (`decide.ts`) on API port **3001**; web defaults to `http://localhost:3001`. File-store remains available via `createApp({ store: "file" })` for tests.

### Why
After merging the Kidist demo next to Mulualem’s API, the product needed one coherent typecheck path and one web→API runtime (ADR 001).

## 2026-09-20 — Merge Kidist `feat/ci-checks` into main

### Changed
Merged the stacked Kidist web/file-store demo onto `main` after Mulualem PRs #11–#16. Default `npm run dev` is still the JSON file store. Postgres + Groq stay available via `createApp({ store: "postgres" })`.

### Why
Judges need the Next.js demo on `main` without dropping Groq, verification, or API security.

## 2026-09-20 — Mulualem

### Changed
Wrote the team problem lock: HULUM is decision and readiness, not another opportunity feed.

### Why
Task 39 needs one page both teammates can use with judges, without claiming we are the official organization.

### Evidence
Branch: `docs/problem-definition`

### Decision
Discovery already exists. HULUM answers eligible / worth it / missing / next step, then points at the official source.

## 2026-09-20 — Mulualem

### Changed
Recorded the v0.1 stack ADR: Next.js, Express, Postgres, deterministic decisions, Groq explain, Voxide in the browser.

### Why
Task 42 must make tech choices traceable and correct the SRS where Claude/Voxide-as-server-STT were wrong.

### Evidence
Branch: `docs/architecture-decisions`

### Decision
Groq explains; `decide()` owns APPLY/MAYBE/SKIP. Voxide is a frontend widget. ScholarXIV is research only. React Native waits.

## 2026-09-20 — Mulualem

### Changed
Added API CORS, secret redaction in errors, invalid-JSON handling, and a rate limit on explain.

### Why
Task 35 must reject bad requests and keep keys out of responses and Git.

### Evidence
Branch: `feat/api-security`

### Decision
CORS uses CLIENT_URL (local web origin if unset, none in production). Full auth waits. Explain is limited to 10 requests per IP per minute.

## 2026-09-20 — Mulualem

### Changed
Added official-source priority, effective VERIFIED / NEEDS_REVIEW / EXPIRED status, and the locked HULUM-is-not-the-organization notice on new analyses.

### Why
Task 34 must keep APPLY/MAYBE/SKIP as HULUM's reading, never the official eligibility or deadline.

### Evidence
Branch: `feat/opportunity-verification`

### Decision
Compute verification on read (30-day stale window). Do not rewrite stored rows. `sourceUrl` is fact authority; `applicationUrl` is apply-only. Expired listings cannot be APPLY.

## 2026-09-20 — Mulualem

### Changed
Added Groq explanation guards. Empty, JSON, invented URLs, or a contradictory APPLY/MAYBE/SKIP word are replaced with the stored summary.

### Why
Task 31 must not show a model reply that fights the engine decision.

### Evidence
Branch: `feat/ai-output-validation`

### Decision
Replace unsafe Groq text; do not 502 the user. Decision, fitScore, and nextAction still come only from the stored analysis.

## 2026-09-20 — Mulualem

### Changed
Added Groq explanation for a stored analysis. The API always returns the engine decision.

### Why
Task 30 needs plain-language explanation without Claude. Groq is the team lock for cost.

### Evidence
Branch: `feat/claude-orchestration`

### Decision
GROQ_API_KEY and GROQ_MODEL live in env. Groq never writes APPLY/MAYBE/SKIP. Default example model is openai/gpt-oss-20b (Groq replacement after Llama 3.3 shutdown).

## 2026-09-19 — Honest development narrative for STARK

### Added
- `docs/stark/narrative.md`: how Kidist and Mulualem actually built v0.1, including two runtimes and empty ScholarXIV.

### Why
Phase 27 required a final development narrative. It must match git, not the original pitch stack.

## 2026-09-19 — Voice gaps uses SHOW_MISSING_REQUIREMENTS

### Changed
- Parser and Ask HULUM emit Task 22 `SHOW_MISSING_REQUIREMENTS` instead of `SHOW_GAPS`. `UNSUPPORTED` stays a runtime fallback.

### Why
Day 20 freeze: final bug fixes only. The lock on `main` and the running demo must use the same intent name.

## 2026-09-19 — STARK submission cover for judges

### Added
- `docs/stark/README.md`: reading order, how to run, and an explicit list of what is not claimed (papers, deploy, live voice, `main` as the full product).

### Why
Day 20 required a final STARK submission package a judge can open without invented evidence.

## 2026-09-19 — Demo script rehearsed against tests (no fake live run)

### Added
- `docs/demo/rehearsal.md`: Day 20 check of the Abeba walkthrough against UI copy and `npm test` (APPLY / MAYBE / SKIP / text-fallback). No browser click-through or video is claimed.

### Why
Day 20 required a final demo rehearsal. The script must still match the file-store product.

## 2026-09-19 — Day 20 final changelog (no rewrite)

### Added
- `docs/stark/changelog-final.md`: freeze pass of `CHANGELOG.md` against git through Mulualem PR #10. Historical entries were not rewritten. File-store demo vs Postgres services stays explicit.

### Why
Day 20 required a final changelog. STARK tracking must still match the repository.

## 2026-09-19 — Git history reviewed (branches, not a rewrite)

### Added
- `docs/stark/git-history.md`: `main` has Mulualem PRs #1–#10; Kidist product work is still on stacked `feat/*`. No Cursor co-author on recent Kidist commits. History was not rewritten.

### Why
Day 20 required a final Git history review. Judges should not treat `main` as the full product.

## 2026-09-19 — Day 20 task status (no new features)

### Changed
- `task.md` / `HULUM_task.md` checkboxes match the running product and tests. Voxide, deploy, ScholarXIV papers, and an un-run browser pass stay open.
- `docs/stark/task-status.md` records what was marked and what was left open.

### Why
Day 20 required a final task status. Stale empty boxes were more misleading than the code.

## 2026-09-19 — Mulualem

### Changed
Added a deterministic readiness checklist from missing and document requirements, plus PATCH status.

### Why
Task 29 needs a stored checklist after analysis, before Claude explanation.

### Evidence
Branch: `feat/readiness-engine`

### Decision
Generation writes TODO and NOT_REQUIRED only. IN_PROGRESS and DONE come from PATCH. Claude does not create checklist items.

## 2026-09-19 — Mulualem

### Changed
Added POST analyze and GET analysis/readiness endpoints that persist the deterministic decision.

### Why
Task 28 needs one request to produce a stored HULUM analysis before Claude or readiness generation.

### Evidence
Branch: `feat/analysis-api`

### Decision
Analyze body is `{ userId }`. nextAction is derived from the stored decision. GET readiness returns stored items and stays empty until Task 29. Claude does not run on analyze.

## 2026-09-19 — Mulualem

### Changed
Added the APPLY/MAYBE/SKIP engine and automated cases for critical mismatch, complete match, and uncertainty.

### Why
Tasks 26–27 need a deterministic decision and score before the analysis API.

### Evidence
Branch: `feat/decision-engine`

### Decision
Critical keys are country, education, and deadline. Key keys add field and language. Fit-score weights are named constants. Claude does not set the decision.

## 2026-09-19 — Mulualem

### Changed
Added deterministic requirement matching with MET, NOT_MET, UNCERTAIN, and NOT_APPLICABLE.

### Why
Task 25 needs auditable profile-vs-opportunity statuses before APPLY/MAYBE/SKIP.

### Evidence
Branch: `feat/requirement-matching`

### Decision
Exact normalized list membership only. Unstructured experience/documents stay UNCERTAIN. Deadline uses an injected clock. Never guess MET.

## 2026-09-19 — Mulualem

### Changed
Added profile create, read, and update APIs with completeness handling.

### Why
Task 24 needs a persisted profile the decision engine can read.

### Evidence
Branch: `feat/profile-service`

### Decision
Full auth waits. POST /api/profile creates a users row plus a profiles row. Completeness lists empty analysis fields.

## 2026-09-19 — Mulualem

### Changed
Added `GET /api/opportunities` and `GET /api/opportunities/:id` with structured requirements and official source fields.

### Why
Task 23 needs a real opportunity API before the browse UI and analysis can use catalog data.

### Evidence
Branch: `feat/opportunity-service`

### Decision
No invented seed opportunities. The list may be empty until official rows are inserted.

## 2026-09-19 — Mulualem

### Changed
Added `@hulum/shared` contracts and switched the server envelope to import them.

### Why
Web, mobile, and server must use one Profile, Opportunity, Analysis, and voice-intent contract.

### Evidence
Branch: `feat/shared-contracts`

### Decision
Voice intents are the locked 9 names. `SHOW_GAPS` is not a contract value; use `SHOW_MISSING_REQUIREMENTS`.

## 2026-09-19 — Mulualem

### Changed
Added PostgreSQL v1 schema, migration runner, and rollback smoke insert/select.

### Why
Task 21 needs durable tables for profiles, opportunities, analyses, and readiness before API services.

### Evidence
Branch: `feat/database-schema`

### Decision
Locked Build Spec §20 table names. Assignments `requirements` is `requirement_results`. Auth RLS policies wait for Task 35.

## 2026-09-19 — Backup demo path without a fake video

### Added
- `docs/demo/backup.md`: 3-minute text path, Analyze-failure path, and API-only path for Abeba Tesfaye. No screenshot pack or recorded video is claimed.

### Why
Day 19 required a backup demo. Voxide and a production host are still missing.

## 2026-09-19 — Changelog reviewed against git (no rewrite)

### Added
- `docs/stark/changelog-review.md`: Day 19 pass of `CHANGELOG.md` against `git log`. Historical entries were not rewritten. Missing PR numbers and screenshots were not invented.

### Why
Day 19 required a changelog review. STARK tracking must match the repository.

## 2026-09-19 — Architecture overview matches the running API

### Changed
- `docs/architecture/overview.md`: Analyze and voice share `runAnalysis`, production CORS, validated Claude, ADR 004. ADR 003 no longer says Analyze is UI-only.

### Why
Day 19 required an architecture review against the code.

## 2026-09-19 — README matches the running v0.1 product

### Changed
- README no longer treats Supabase, Voxide, ScholarXIV, or EthioDeploy as live. It describes the file store, text/quick-action voice, optional Claude, and local demo.

### Why
Day 19 required a README review against the code, not the original pitch stack.

## 2026-09-19 — STARK evidence index (honest gaps included)

### Added
- `docs/stark/evidence.md` maps problem, ideation, ADRs, demo, changelog, and GitHub to files. ScholarXIV papers, production deploy, and Voxide stay listed as gaps.

### Why
Day 19 required STARK documentation a judge can follow without invented research or a fake host.

## 2026-09-19 — STARK demo script for Abeba Tesfaye

### Added
- `docs/demo/script.md`: timed walkthrough (Abeba → A2SV APPLY, optional UCT MAYBE / Chevening SKIP), text backup instead of live voice, and what not to claim.

### Why
Day 19 required a demo script that matches the running product.

## 2026-09-19 — Assistant backup mode when Voxide is missing

### Added
- Ask HULUM shows Voice unavailable from the session provider (or a failed session create), keeps text + quick actions, and offers Type a request or Browse opportunities.

### Why
Phase 21 required a usable product when voice fails. Microphone STT is still unwired.

## 2026-09-19 — Failure paths keep APPLY/MAYBE/SKIP from the engine

### Added
- API tests: UCT MAYBE (uncertain), Chevening SKIP (not met), expired A2SV SKIP, Voxide missing → text-fallback.
- Claude timeout uses the engine summary instead of failing Analyze.

### Why
Days 17–18 required failure testing. Microphone and live Voxide STT stay blocked.

## 2026-09-19 — Analysis keeps an official source link and the responsible-AI notice

### Added
- Analysis screen: Apply officially, Official source, disclaimer notice. External links use `noopener noreferrer`.
- Integration test: stored analysis includes `sourceUrl`, `applicationUrl`, and the official-organization disclaimer.

### Why
Days 17–18 required E2E coverage of the official source path. Deploy is still blocked without a host. Voice E2E is the text-fallback loop (ADR 003).

## 2026-09-19 — Production env refuses to start without a CORS origin

### Added
- `loadEnv` requires `CLIENT_URL` as an http(s) origin when `NODE_ENV=production`. Default API port is 4000.
- README lists required vs optional host variables. Claude, Voxide, and Supabase stay optional; the file store is still the default.

### Why
Days 15–16 required production configuration. This is not a live deploy.

## 2026-09-19 — API security pass: keys stay off the wire

### Added
- Security headers (`nosniff`, `DENY` framing, `no-store`) and production CORS that does not default to localhost.
- Tests: Claude/Voxide keys and voice transcripts must not appear in health, session, or 404 bodies.

### Why
Days 15–16 required a security review of the running API. Full login is still P1; v0.1 uses a local `userId`.

## 2026-09-19 — API failures stay in the `{ data, error }` envelope

### Added
- Express error handler for invalid JSON and oversized bodies, without leaking parser internals.
- Tests: unknown route/opportunity/analysis, analyze without userId or profile, invalid voice body, unsupported utterance.

### Why
Days 15–16 required error handling against the real API.

## 2026-09-19 — Full voice flow is covered through the text-fallback API

### Added
- Integration test: session, internships, current opportunity, analyze A2SV, why, gaps, readiness, then APPLY filter without extra stored analyses.

### Changed
- File store reads `STORE_PATH` when loading or saving, so tests can isolate `store.json`.

### Why
Days 15–16 required the full voice flow against the real API. Voxide is still unwired (ADR 003).

## 2026-09-19 — Analysis → readiness is covered through the API

### Added
- Integration test: Analyze A2SV, GET the stored checklist, PATCH an item to DONE, then confirm the status persists.

### Why
Days 15–16 required the full analysis → readiness flow against the real API.

## 2026-09-19 — Profile → opportunity → analysis is covered through the API

### Added
- Integration test: demo profile, sourced A2SV record, Analyze, then GET the stored APPLY/MAYBE/SKIP result.

### Why
Days 15–16 required the full profile → opportunity → analysis flow against the real API.

## 2026-09-19 — Assistant describes the current opportunity from stored facts

### Added
- “Tell me about this opportunity” uses the selected stored record: title, type, deadline, official source, and the saved APPLY/MAYBE/SKIP if one exists.
- Without a selected opportunity, HULUM asks the user to choose one instead of opening the first catalog item.

### Why
Days 13–14 required a contextual assistant grounded in HULUM, not a free chatbot.

## 2026-09-19 — Claude JSON is validated before it reaches the user

### Added
- Claude must return `{ decision, explanation }`. Invalid JSON, a different APPLY/MAYBE/SKIP, official-eligibility claims, or erased uncertainty are replaced with the engine summary.

### Why
Task 31 / Days 13–14 required structured AI output validation. The engine decision is not changed.

## 2026-09-19 — Claude may only rephrase the engine decision

### Added
- Explanation service uses `CLAUDE_API_KEY` / `CLAUDE_MODEL` (or the Anthropic aliases). Missing key or model keeps the engine summary.
- Claude text that names a different APPLY / MAYBE / SKIP is discarded.
- Tests cover no-key fallback and contradictory wording.

### Why
Days 13–14 required Claude explanation. The deterministic engine remains the source of truth.

## 2026-09-19 — English is the stable v0.1 language end-to-end

### Added
- Language selector on profile and assistant using existing `en` / `am` / `om` codes. Changing language restarts the voice session.
- English integration test: session → internships → analyze A2SV → why → missing → prepare.
- ADR 004: English is the stable path; Amharic/Oromo are stored for Voxide and are not claimed as live speech.

### Why
Days 10–12 required one stable language end-to-end. Voxide is still not live.

## 2026-09-18 — Voice intent mapping covers documented utterances

### Added
- Unit tests for `parseVoiceIntent` against the Phase 12 examples plus Amharic keywords already in the parser.
- Confirms “Should I apply for this?” stays analyze, while “Show me opportunities I should apply for” stays APPLY catalog filter.

### Why
Days 10–12 required voice intent mapping. No new intents. Voxide is still not live.

## 2026-09-18 — Voice session is persisted without transcripts

### Added
- `POST /api/voice/session` stores id, user, language, and start time in the file store. Utterance text is not saved.
- The assistant starts that session on load and shows whether Voxide or text-fallback is active.

### Why
Days 10–12 required a voice session. Voxide is still not live; the session is the same text-fallback path as ADR 003.

## 2026-09-18 — Voice filters opportunities by APPLY / MAYBE / SKIP

### Added
- `FILTER_BY_DECISION` scores the catalog with the same engine as Analyze and lists matching opportunities. Those scores are not stored, so a later Why / missing / prepare still uses the last saved analysis.
- Test: “Show me opportunities I should apply for” is a catalog filter, not analyze-this. Chevening stays in SKIP, not APPLY.

### Why
Days 10–12 required voice filter/show by decision. Voxide is still not live.

## 2026-09-18 — Voice gaps uses stored NOT_MET / UNCERTAIN requirements

### Added
- `SHOW_GAPS` loads the latest analysis for the user/opportunity and replies with stored missing or uncertain requirements.
- Test: analyze Chevening, then “What am I missing?” returns those requirement texts and statuses.

### Why
Days 10–12 required voice → gaps after readiness. Voxide is still not live.

## 2026-09-18 — Voice readiness uses stored checklist

### Added
- `SHOW_READINESS` loads the latest analysis for the user/opportunity and replies with next action plus checklist titles and status.
- Test: analyze A2SV, then “What should I prepare?” returns stored readiness items.

### Why
Days 10–12 required voice → readiness after explanation. Voxide is still not live.

## 2026-09-18 — Voice explanation uses stored engine result

### Added
- `EXPLAIN_DECISION` loads the latest analysis for the user/opportunity if no analysis id is sent.
- Reply starts with APPLY/MAYBE/SKIP, then the stored explanation. The engine decision is not changed.
- Test: analyze A2SV, then “Why did you say that?” returns the same decision.

### Why
Days 10–12 required voice → explanation after voice → analysis. Voxide is still not live.

## 2026-09-18 — Voice analyze uses the decision engine

### Added
- Text/quick-action `ANALYZE_OPPORTUNITY` now calls the same `runAnalysis` path as the Analyze button.
- Assistant keeps the new analysis id so Why / missing / readiness can follow in the same session.
- Vitest coverage that the reply is APPLY/MAYBE/SKIP, not “click Analyze”.

### Why
Task 11/33: voice must trigger real HULUM actions. Voxide is still not connected.

### Decision
The deterministic engine remains the source of truth. No new voice intents.

## 2026-09-18 — Phase 4 accessibility

### Added
- Skip-to-content link, visible keyboard focus, and 44px touch targets on core controls.
- Decision labels, requirement status text plus edge marks, and official links announced as new tabs.
- Darker APPLY / MAYBE / SKIP and muted colors so meaning does not depend on color alone.

### Why
Phase 4 P1 required the main journey to stay usable with keyboard, contrast, and non-color cues.

## 2026-09-18 — Mulualem

### Changed
Added the Express + TypeScript backend scaffold, module folders, and `GET /api/health`.

### Why
Task 20 needs a running server, a health check, and a fixed place for later services without putting secrets in Git.

### Evidence
Branch: `feat/backend-scaffold`

### Decision
Backend tests use Vitest. Shared contracts stay in Task 22; the running server still uses the file-store vertical slice until Supabase is wired.

## 2026-09-18 — Phase 4 opportunity search

### Added
- Opportunity list search box combined with the existing type filter.
- `GET /api/opportunities?q=` matches title, organization, description, type, country, and field text.
- Empty-search recovery: clear search or clear filter.

### Why
Phase 4 P1 required list search so users can find a sourced record without scrolling the full catalog.

## 2026-09-18 — Phase 4 loading, empty, and error states

### Added
- Shared `StatusPanel` on profile, opportunities, analysis, and assistant.
- Retry / next-action paths for API, network, missing profile, empty lists, and missing records.
- Safer client fetch: connection failures no longer surface raw `Failed to fetch` text.

### Why
Phase 4 P1 required loading, empty, and failure UI with recovery, without exposing technical errors.

### Decision
Voice microphone failure is an honest “not connected” control. Voxide is still not live.

## 2026-09-18 — Architecture confirmation

### Added
- `docs/architecture/overview.md` — runtime as built (Next.js, Express, JSON store, engine).
- ADRs: file store before Supabase; engine as source of truth; text voice fallback until Voxide.

### Why
Days 1–2 required architecture confirmation before treating later phases as unblocked.

### Decision
Do not pretend Supabase or Voxide are live. Shared contracts stay in `packages/shared`.

## 2026-09-18 — Phase 3 competitive research

### Added
- `docs/research/competitive-analysis.md` — EthioScholarship, Fastweb, Bold.org, Scholly, Scholar Africa, and related channels, checked on public web.
- Unverified v0.1 spec names left off the judge-facing list.
- Voice-decision competitors: none verified this pass (not claimed as proof of uniqueness).

### Why
Phase 3 is P0. Differentiation is decision + readiness + voice + local language, not “AI matching.”

## 2026-09-18 — Kidist / Phase 2 ScholarXIV ideation space

### Added
- `docs/research/` — canonical ideation/research folder.
- `docs/research/ideation.md` — alternatives, rejected ideas, why HULUM was selected.
- `docs/research/scholarxiv.md` — query list and empty paper table (no fabricated citations).

### Why
STARK ideation needs a real trail. Papers and MCP/API calls have not been run yet and are marked blocked.

## 2026-09-18 — Kidist / Phase 1 product definition

### Added
- `docs/product/problem.md` — discovery vs decision, wasted applications, uncertainty, readiness, Ethiopian context, product gap.
- `docs/product/personas.md` — student, professional, guest, demo persona Abeba Tesfaye.
- `docs/product/research-questions.md` — Phase 1 questions with hypotheses; no fabricated papers.

### Why
`task.md` Phase 1 is Kidist P0 before ScholarXIV (Phase 2) and further UX polish.

### Decision
Working hypotheses are labeled as such. ScholarXIV evidence is explicitly deferred.

## 2026-09-18 — Kidist / Phase 4 product UX

### Added
- Canonical `team_assignments.md` and `git-workflow.md`.
- `docs/product/hulum-flow.md` mapping the task.md journey to live routes.
- Landing page that shows APPLY / MAYBE / SKIP meaning and the full user journey.

### Why
Kidist owns product/UX. Phase 4 requires the core journey to be visible before more frontend polish or voice work.

### Evidence
Branch `feat/web-product-ux`

## 2026-09-18 — Foundation

### Added
- Monorepo scaffold: Next.js web app, Express API, shared TypeScript contracts.
- Deterministic requirement matcher and APPLY / MAYBE / SKIP engine.
- Curated seed opportunities with official source URLs.
- First vertical slice: profile → opportunity → analysis → readiness → assistant fallback.

### Why
The locked v0.1 spec requires a working decision loop before voice polish or extra features.

### Decision
The decision engine is the source of truth. Claude, when configured, only explains structured results. Voice falls back to text if Voxide is unavailable.
