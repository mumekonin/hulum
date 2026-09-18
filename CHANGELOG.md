# Changelog

HULUM records actual work. Do not invent history.

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
