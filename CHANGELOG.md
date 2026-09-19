# Changelog

HULUM records actual work. Do not invent history.

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
