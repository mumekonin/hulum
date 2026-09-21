# Changelog

HULUM records actual work. Do not invent history.

## 2026-09-21 — Postgres Ask HULUM + optional Voxide widget

### Added
- Postgres `/api/voice/session` and `/api/voice/action` use `decide()` / analysis services (text fallback works on `npm run dev`).
- `@voxide/react` + `VoxidePanel` on `/assistant` when `NEXT_PUBLIC_VOXIDE_PUBLIC_KEY` (`vox_pub_…`) is set; capabilities call the same voice action API.

### Why
After switching the default store to Postgres, Ask HULUM had an empty voice router. Development integration for Voxide is the browser widget path (ADR 001), not a server STT client.

## 2026-09-21 — Voxide integration requirements studied

### Added
- `docs/research/voxide-integration.md`: browser `@voxide/react` widget, publishable key + domain whitelist, capabilities that call existing HULUM APIs. No install, no mic claim, no Amharic STT claim.

### Why
Phase 12 P0 required studying Voxide before wiring. Public docs confirm a client widget, not a server voice API (ADR 001).

## 2026-09-21 — CI checks and local-only deployment decision

### Added
- `.github/workflows/ci.yml`: `npm ci`, `typecheck:shared`, `typecheck:server`, `npm test`. No lint, no web/server build gate, no deploy, no branch-protection claim.
- `docs/stark/deployment.md`: v0.1 stays local; no EthioDeploy URL.

### Changed
- Task checkboxes: readiness-plan generation (deterministic `buildReadinessItems`), Postgres database connection, CI install/typecheck/tests, deployment decision/guide.
- Next.js webpack maps shared `.js` imports to TypeScript sources.

### Why
Phase 10/14 checkboxes lagged the shipped readiness + Postgres path. Phase 23–24 and Phase 26 needed an honest CI gate and deployment decision without inventing a host.

## 2026-09-21 — Shared exports and Postgres dev runtime

### Changed
- `@hulum/shared` relative imports use `.js` so `typecheck:shared` passes under NodeNext.
- `npm run dev` boots Postgres (`decide.ts`) on API port **3001**; web defaults to `http://localhost:3001`. File-store remains available via `createApp({ store: "file" })` for tests.

### Why
After merging the Kidist demo next to Mulualem’s API, the product needed one coherent typecheck path and one web→API runtime (ADR 001).

## 2026-09-21 — Conflicting profile facts stay UNCERTAIN

### Changed
- Matchers no longer treat mixed signals as MET: field of study vs skills/interests, years vs “no experience” text, and in-progress education with a past graduation year (file-store and Postgres `requirements/match`).

### Why
Phase 8 required handling conflicting information. Guessing MET from one fact while another fact contradicts it would hide a MAYBE.

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
