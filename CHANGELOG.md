# Changelog

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

## 2026-09-18 — Mulualem

### Changed
Added the Express + TypeScript backend scaffold, module folders, and `GET /api/health`.

### Why
Task 20 needs a running server, a health check, and a fixed place for later services without putting secrets in Git.

### Evidence
Branch: `feat/backend-scaffold`

### Decision
Backend tests use Vitest. Shared contracts stay in Task 22; the server uses a local `{ data, error }` envelope until then.
