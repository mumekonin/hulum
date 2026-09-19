# Changelog

HULUM records actual work. Do not invent history.

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
