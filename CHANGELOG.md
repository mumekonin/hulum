# Changelog

HULUM records actual work. Do not invent history.

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
