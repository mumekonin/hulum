# Changelog

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

## 2026-09-18 — Mulualem

### Changed
Added the Express + TypeScript backend scaffold, module folders, and `GET /api/health`.

### Why
Task 20 needs a running server, a health check, and a fixed place for later services without putting secrets in Git.

### Evidence
Branch: `feat/backend-scaffold`

### Decision
Backend tests use Vitest. Shared contracts stay in Task 22; the server uses a local `{ data, error }` envelope until then.
