# @hulum/shared

Canonical TypeScript contracts for web, mobile, and server.

Import from here. Do not copy these types into `apps/web` or `apps/server`.

```ts
import { Decision, VoiceIntent, type Analysis } from "@hulum/shared";
```

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

Do not use `SHOW_GAPS`. That action is `SHOW_MISSING_REQUIREMENTS`.

`Requirement` is an analysis outcome (`requirement_results`). Opportunity source facts stay on `Opportunity`.

Profile API types: `CreateProfileRequest`, `PatchProfileRequest`, `ProfileView`. Completeness uses `profileCompleteness()`.

Matcher keys: `RequirementKey`. Matcher rows: `RequirementMatch`. Decision payload: `DecisionResult`. Analyze body: `AnalyzeOpportunityRequest` (`{ userId }`). Readiness patch: `PatchReadinessRequest` (`{ status }`). Explain body: `ExplainAnalysisRequest` (`{ language?: "en" | "am" | "om" }`). Explain result: `AnalysisExplanation` (decision copied from the stored analysis). Official-source copy: `OFFICIAL_SOURCE_NOTICE` (show on opportunity and analysis screens).

Tell both teammates before changing these names.
