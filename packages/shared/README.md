# @hulum/shared

Canonical TypeScript contracts for web, mobile, and server.

Runtime imports used by the running API and web app:

```ts
import type { Analysis, Decision } from "@hulum/shared";
```

Those come from `src/constants.ts`, `src/types.ts`, and `src/schemas.ts` (Zod).

Task 22 lock objects (`Decision`, `VoiceIntent`, envelope `ok`/`fail`) also live in `src/enums.ts` and `src/api.ts`. Gaps use `SHOW_MISSING_REQUIREMENTS` (not `SHOW_GAPS`). Runtime still allows `UNSUPPORTED` as a parser fallback. Do not copy types into `apps/web` or `apps/server`.

## Voice intents (locked, Task 22)

```text
SHOW_OPPORTUNITIES
FILTER_OPPORTUNITIES
FILTER_BY_DECISION
OPEN_OPPORTUNITY
ANALYZE_OPPORTUNITY
EXPLAIN_DECISION
SHOW_MISSING_REQUIREMENTS
SHOW_READINESS
UPDATE_PROFILE
```

`Requirement` is an analysis outcome (`requirement_results`). Opportunity source facts stay on `Opportunity`.

Profile API types: `CreateProfileRequest`, `PatchProfileRequest`, `ProfileView`. Completeness uses `profileCompleteness()`.

Matcher keys: `RequirementKey`. Matcher rows: `RequirementMatch`. Decision payload: `DecisionResult`. Analyze body: `AnalyzeOpportunityRequest` (`{ userId }`). Readiness patch: `PatchReadinessRequest` (`{ status }`). Explain body: `ExplainAnalysisRequest` (`{ language?: "en" | "am" | "om" }`). Explain result: `AnalysisExplanation` (decision copied from the stored analysis). Official-source copy: `OFFICIAL_SOURCE_NOTICE` (show on opportunity and analysis screens).

Tell both teammates before changing these names.
