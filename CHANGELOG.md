# Changelog

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

## 2026-09-18 — Mulualem

### Changed
Added the Express + TypeScript backend scaffold, module folders, and `GET /api/health`.

### Why
Task 20 needs a running server, a health check, and a fixed place for later services without putting secrets in Git.

### Evidence
Branch: `feat/backend-scaffold`

### Decision
Backend tests use Vitest. Shared contracts stay in Task 22; the server uses a local `{ data, error }` envelope until then.
