# HULUM — Task Management & Implementation Plan

**Project:** HULUM — AI Opportunity Decision & Readiness Agent  
**Hackathon:** STARK Hackathon 2026  
**Team:** Kidist + Mulualem  
**Build Window:** Maximum 20 days  
**Version:** 1.0  
**Status:** Active Engineering Plan

---

# 1. Purpose

This is the master implementation checklist for HULUM.

| Task | Title | Owner | Status |
|---|---|---|---|
| 20 | Backend platform scaffold | Mulualem | DONE |
| 21 | Database schema v1 | Mulualem | DONE |
| 22 | Shared TypeScript contracts | Mulualem + Kidist | DONE |
| 23 | Opportunity service | Mulualem | DONE |
| 24 | Profile service | Mulualem | DONE |
| 25 | Requirement matching engine | Mulualem | DONE |
| 26 | APPLY/MAYBE/SKIP decision engine | Mulualem | DONE |
| 27 | Decision-engine tests | Mulualem | DONE |
| 28 | Analysis API | Mulualem | DONE |
| 29 | Readiness engine | Mulualem | DONE |
| 30 | Groq AI orchestration | Mulualem | DONE |
| 31 | AI output validation | Mulualem | DONE |
| 32 | Voxide widget (no Express STT) | Mulualem | DONE |
| 33 | Voice intent/action service | Mulualem | DONE |
| 34 | Opportunity verification | Mulualem | DONE |
| 35 | API security and validation | Mulualem | DONE |
| 36 | Integration testing | Mulualem + Kidist | DONE |
| 48 | AI Opportunity Investigator | Mulualem | DONE |
| 49 | Product UI transformation, onboarding, profile, Ask HULUM redesign | Kidist | DONE (`#49` / tip of `main`) |
| 39 | Problem definition | Kidist + Mulualem | DONE |
| 42 | Architecture decision record | Mulualem + Kidist | DONE |

HULUM helps Ethiopian students and young professionals decide which opportunities are worth their time and understand exactly what they need to do next.

Supported opportunity types may include:

- Scholarships
- Fellowships
- Internships
- Jobs
- Grants
- Competitions

HULUM is **not** intended to be a generic chatbot or simply another opportunity listing website.

## Core product principle

> HULUM does not just find opportunities. It tells you which ones are worth your time — and exactly what to do next.

## Core engineering principle

```text
User Profile
    ↓
Opportunity Requirements
    ↓
Deterministic Requirement Matching
    ↓
APPLY / MAYBE / SKIP
    ↓
Explanation
    ↓
Missing Requirements
    ↓
Readiness Checklist
    ↓
Next Action
```

AI explains and assists the decision. Structured data and deterministic rules remain the source of truth.

---

# 2. Status & Priority

### Status

- `[ ]` Not started
- `[-]` In progress
- `[x]` Completed
- `[!]` Blocked
- `[?]` Needs decision

### Priority

- **P0** — Critical MVP/demo requirement
- **P1** — High priority
- **P2** — Medium priority
- **P3** — Future / explicitly outside the 20-day MVP

---

# 3. Team Ownership

## Kidist

Primary ownership:

- Frontend
- UX/UI
- Responsive/mobile experience
- Voice UX
- Language UX
- Amharic UX
- Demo experience
- Product documentation
- Research/ideation documentation

## Mulualem

Primary ownership:

- Backend
- API
- Database/Supabase/PostgreSQL
- Requirement matching
- APPLY/MAYBE/SKIP decision engine
- Readiness engine
- Claude integration
- Voxide backend integration
- Security
- Deployment/backend infrastructure

## Shared

- ScholarXIV research
- Product ideation
- Architecture decisions
- Shared contracts/types
- Integration
- Testing
- Demo rehearsal
- STARK documentation/evidence
- Final deployment verification

---

# 4. Phase 0 — Project Foundation

- [x] **P0** Confirm repository and GitHub workflow.
- [x] **P0** Add/verify `README.md`.
- [x] **P0** Add/verify `task.md`.
- [x] **P0** Add/verify `team_assignments.md`.
- [x] **P0** Add/verify `git-workflow.md`.
- [x] **P0** Add/verify `CHANGELOG.md`.
- [x] **P0** Add `.gitignore`.
- [x] **P0** Add `.env.example`.
- [x] **P0** Configure package manager and scripts.
- [x] **P0** Initialize frontend.
- [x] **P0** Initialize backend.
- [x] **P0** Establish shared types/constants.
- [x] **P1** Configure linting.
- [x] **P1** Configure formatting.
- [x] **P1** Configure testing.
- [x] **P1** Configure CI checks.

## Recommended structure

```text
hulum/
├── apps/
│   ├── web/
│   └── server/
├── packages/
│   └── shared/
├── database/
│   ├── migrations/
│   └── seeds/
├── docs/
│   ├── research/
│   ├── product/
│   ├── architecture/
│   ├── decisions/
│   └── demo/
├── scripts/
├── .github/
│   ├── workflows/
│   └── pull_request_template.md
├── .cursor/
│   └── rules/
├── README.md
├── task.md
├── team_assignments.md
├── git-workflow.md
├── CHANGELOG.md
├── .gitignore
├── .env.example
└── package.json
```

---

# 5. Phase 1 — Research & Product Definition

## Problem validation

- [x] **P0** Document the opportunity-discovery problem.
- [x] **P0** Document the opportunity-decision problem.
- [x] **P0** Document why users waste time applying to opportunities they are unlikely to qualify for.
- [x] **P0** Document uncertainty around eligibility requirements.
- [x] **P0** Document readiness gaps after a user finds an opportunity.
- [x] **P0** Document relevant Ethiopian user context.
- [x] **P1** Define target user personas.
- [x] **P1** Define the exact product gap HULUM addresses.

## Research questions

- [-] Barriers to applying for eligible opportunities among Ethiopian students.
- [-] Causes of opportunity application failure among African youth.
- [x] Responsible AI eligibility uncertainty.
- [x] Opportunity matching and decision-support systems.
- [-] Voice-first design for non-English speakers. <!-- Ask HULUM text/quick actions proven; live non-English STT not mic-tested -->
- [-] Multilingual interaction for English/Amharic/Afaan Oromo users. <!-- Amharic text UX shipped; Oromo UI/voice + live STT still open (ADR 004) -->
- [x] Readiness support for scholarship/internship/job applications.
- [x] Trust and verification of opportunity requirements.
- [x] Human oversight when AI assists eligibility decisions.

---

# 6. Phase 2 — ScholarXIV Ideation Evidence

ScholarXIV is part of the STARK ideation requirement.

- [x] **P0** Create ScholarXIV ideation/research space.
- [x] **P0** Document the original problem.
- [!] **P0** Add relevant research papers.
- [!] **P0** Record research findings.
- [x] **P0** Document how the HULUM idea developed.
- [x] **P0** Document alternative ideas considered.
- [x] **P0** Document rejected ideas.
- [x] **P0** Explain why HULUM was selected.
- [x] **P1** Explore ScholarXIV MCP integration.
- [x] **P1** Explore ScholarXIV Papers API.
- [x] **P1** Link research findings to product decisions.
- [x] **P1** Preserve research evidence in repository documentation.

## Required ideation narrative

```text
Problem
  ↓
Research
  ↓
Observed user pain
  ↓
Alternative ideas
  ↓
Rejected approaches + reasons
  ↓
HULUM concept
  ↓
Prototype
  ↓
User/product learning
  ↓
Iteration
  ↓
Final MVP
```

---

# 7. Phase 3 — Competitive Research

- [x] **P0** Research Ethiopian opportunity platforms.
- [x] **P0** Research global scholarship/opportunity platforms.
- [x] **P1** Research AI opportunity-matching products.
- [x] **P1** Research voice-enabled opportunity systems.
- [x] **P1** Research African opportunity platforms.
- [x] **P1** Record competitor capabilities.
- [x] **P1** Record relevant gaps/differences.
- [x] **P1** Record features explicitly excluded from HULUM.
- [x] **P1** Save findings to `docs/research/competitive-analysis.md`.

## Positioning to preserve

Do not claim that "AI matching" itself is unique.

The differentiation to investigate and demonstrate is the combination of:

```text
Opportunity
+
Eligibility decision
+
Explanation
+
Readiness
+
Voice interaction
+
English / Amharic / Afaan Oromo support
+
Ethiopian target users
```

Any external competitor claims used in the final presentation must be verified before submission.

---

# 8. Phase 4 — Product & UX

## Core journey

```text
User creates profile
        ↓
HULUM shows opportunities
        ↓
User opens opportunity
        ↓
User asks "Should I apply?"
        ↓
Requirement matching
        ↓
APPLY / MAYBE / SKIP
        ↓
Why?
        ↓
Matched + missing requirements
        ↓
Readiness checklist
        ↓
Next action
        ↓
Official opportunity source
```

## Core screens

- [x] **P0** Landing/home.
- [x] **P0** Profile creation/edit.
- [x] **P0** Opportunity list.
- [x] **P0** Opportunity details.
- [x] **P0** Analyze opportunity.
- [x] **P0** APPLY/MAYBE/SKIP result.
- [x] **P0** Explanation view.
- [x] **P0** Requirement status view.
- [x] **P0** Readiness checklist.
- [-] **P0** Voice interaction. <!-- live mic; Ask HULUM text/quick actions are shipped -->
- [x] **P0** Official source/application link.
- [x] **P1** Filters.
- [x] **P1** Search.
- [x] **P1** Error/failure states.
- [x] **P1** Loading/empty states.
- [x] **P1** Accessibility improvements.

## Decision UI

The decision should be visually dominant.

Use:

```text
APPLY
MAYBE
SKIP
```

Avoid making the interface look like a generic AI chat product.

---

# 9. Phase 5 — User Profile

## Profile fields

- [x] **P0** Name.
- [x] **P0** Education level.
- [x] **P0** Field of study.
- [x] **P0** Graduation year.
- [x] **P0** Country.
- [x] **P0** Location.
- [x] **P0** Skills.
- [x] **P0** Experience.
- [x] **P0** Languages.
- [x] **P0** Interests.
- [x] **P1** Optional profile fields as defined by MVP scope.

## Profile behavior

- [x] **P0** Create profile.
- [x] **P0** Edit profile.
- [x] **P0** Persist profile.
- [x] **P0** Validate profile fields.
- [x] **P0** Use profile in requirement matching.
- [x] **P1** Extract profile information from voice/text using AI.
- [x] **P1** Allow user confirmation before saving AI-extracted facts.

---

# 10. Phase 6 — Opportunity Data Model

## Opportunity fields

```text
Opportunity
├── id
├── title
├── organization
├── type
├── description
├── deadline
├── countryEligibility
├── educationRequirements
├── fieldRequirements
├── experienceRequirements
├── languageRequirements
├── documentRequirements
├── otherRequirements
├── applicationUrl
├── sourceUrl
├── sourceType
├── verificationStatus
├── lastVerifiedDate
├── createdAt
└── updatedAt
```

- [x] **P0** Define opportunity schema.
- [x] **P0** Create database model.
- [x] **P0** Create seed/demo opportunities.
- [x] **P0** Store official source URL.
- [x] **P0** Store application URL where available.
- [x] **P0** Store verification status.
- [x] **P0** Store last verified date.
- [x] **P1** Add opportunity search/filtering.
- [x] **P1** Add opportunity import workflow if required.

---

# 11. Phase 7 — Opportunity Verification

HULUM should not treat generated AI content as authoritative opportunity requirements.

- [x] **P0** Define verification status model.
- [x] **P0** Store source URL.
- [x] **P0** Store official application URL.
- [x] **P0** Store last verification date.
- [x] **P0** Display source/verification information.
- [x] **P0** Add responsible-AI notice.
- [x] **P1** Define manual verification workflow.
- [x] **P1** Define stale-opportunity behavior.

## Responsible AI notice

> HULUM's analysis is based on the information available from the opportunity source and your profile. Always verify final eligibility and deadlines with the official organization.

---

# 12. Phase 8 — Requirement Status Engine

Each relevant requirement should be represented using:

```text
MET
NOT_MET
UNCERTAIN
NOT_APPLICABLE
```

**Verify:** matching is deterministic and covered by representative tests.

### Task 26 — APPLY/MAYBE/SKIP decision engine (Days 5–8)
**Depends on:** Task 25.

> Implement the core decision rules:

```text
Critical NOT_MET → SKIP
Key requirements met + no significant uncertainty → APPLY
Otherwise → MAYBE
```

Return:

```text
decision
fitScore
matchedRequirements
missingRequirements
uncertainRequirements
reasons
nextAction
```

**Verify:** identical profile + opportunity inputs produce identical structured results.

### Task 27 — Decision-engine tests (Days 6–8)
**Depends on:** Task 26.

> Test critical mismatch, complete match, optional mismatch, uncertainty,
> incomplete profile, education mismatch, language mismatch, and experience uncertainty.

**Verify:** decision rules have automated coverage.

### Task 28 — Analysis API (Days 7–9)
**Depends on:** Tasks 24–27.

Implement:

```text
POST /api/opportunities/:id/analyze
GET  /api/analyses/:id
GET  /api/analyses/:id/readiness
```

**Verify:** one request produces a complete structured HULUM analysis.

### Task 29 — Readiness engine (Days 8–10)
**Depends on:** Task 26.

> Convert missing requirements and document requirements into actionable readiness
> items with `TODO`, `IN_PROGRESS`, `DONE`, and `NOT_REQUIRED` states.

**Verify:** an analysis produces a useful readiness checklist.

### Task 30 — Claude AI orchestration (Days 9–12)
**Depends on:** stable analysis contract.

> Team lock (2026-09-20, Kidist + Mulualem): Groq explains stored analysis. Claude is not used. The engine still owns APPLY/MAYBE/SKIP.

Claude handles natural-language profile extraction, explanation, requirement
explanation, readiness-plan language, contextual Q&A, and multilingual explanation.

Claude is not the sole authority for official deadlines, requirements, stored profile
facts, deterministic matching, or APPLY/MAYBE/SKIP.

**Verify:** Claude explains structured analysis without silently changing the decision.

### Task 31 — AI output validation (Days 10–12)
**Depends on:** Task 30.

```text
Claude output
    ↓
Schema validation
    ↓
Analysis consistency checks
    ↓
Uncertainty/safety checks
    ↓
User-facing explanation
```

**Verify:** malformed or contradictory output is rejected or safely replaced.

### Task 32 — Voxide backend integration (Days 10–14)
**Depends on:** Task 30 and shared voice contract.
**Status:** DONE as a browser widget (2026-09-25). No Express STT/TTS. Live mic still needs a local `vox_pub_…` key and dashboard whitelist for `http://localhost:3000`.

> Integrate voice processing and supported language handling.

**Verify:** a real voice request can trigger a real HULUM action.

### Task 33 — Voice intent/action service (Days 11–14)
**Depends on:** Task 32.
**Status:** DONE (2026-09-25). Typed Ask HULUM and the Voxide widget both call `POST /api/voice/action`.

> Map voice requests to existing HULUM services for analysis, explanation, missing
> requirements, readiness, filtering, opening opportunities, and profile updates.

**Verify:** voice uses the same core product logic as text/UI actions.

### Task 34 — Opportunity verification (Days 11–15)
**Depends on:** opportunity model.

> Define source priority, verification status, stale-data handling, and official-source
> behavior.

**Verify:** HULUM clearly distinguishes its analysis from the official organization's
final eligibility/deadline authority.

### Task 35 — API security and validation (Days 12–15)
**Depends on:** API implementation.

> Validate requests, protect secrets, configure CORS, handle errors, and add auth if
> required by the final MVP.

**Verify:** invalid requests are rejected and secrets never appear in responses or Git.

### Task 36 — Integration testing (Days 14–17)
**Shared with:** Kidist.
**Status:** DONE (2026-09-22, Mulualem). Postgres API slice, web screens, and Next.js shared-import fix are on `main`. Voice stays text. No Voxide backend.

Test:

```text
Profile → Opportunity → Analysis → Matching → Decision → Groq explains stored analysis → Readiness → text voice (file store) → UI
```

Team lock: Groq explains. The engine still owns APPLY / MAYBE / SKIP. No Voxide backend.

**Verify:** the core vertical slice uses real services and persisted data.

### Task 37 — Deployment & production hardening (Days 17–19)
**Depends on:** integration pass.

> Deploy backend/database, configure production secrets, CORS, health checks,
> logging, and environment configuration. Investigate EthioDeploy.

**Verify:** deployed API passes health and smoke tests.

### Task 38 — Final technical sign-off (Day 20)
**Coordinates:** whole team.

> Run the complete production walkthrough covering profile, opportunity, decision,
> AI explanation, readiness, voice, mobile/web integration, failure paths, and source links.

**Verify:** final HULUM demo is reproducible from the deployed system.

- [x] **P0** Define requirement schema.
- [x] **P0** Define requirement categories.
- [x] **P0** Match profile facts to requirements.
- [x] **P0** Produce requirement statuses.
- [x] **P0** Preserve uncertainty.
- [x] **P0** Handle missing profile information.
- [x] **P0** Handle conflicting information.
- [x] **P1** Add requirement explanations.
- [x] **P1** Add unit tests for matching.

---

# 13. Phase 9 — APPLY / MAYBE / SKIP Decision Engine

The decision engine is deterministic and is the source of truth.

Initial logic:

```text
Critical NOT_MET
    ↓
SKIP

Key requirements met
+ no significant uncertainty
    ↓
APPLY

Otherwise
    ↓
MAYBE
```

- [x] **P0** Define decision schema.
- [x] **P0** Define critical requirements.
- [x] **P0** Implement decision rules.
- [x] **P0** Implement decision explanation data.
- [x] **P0** Implement fit score if included in MVP.
- [x] **P0** Ensure fit score never replaces the decision rules.
- [x] **P0** Add unit tests.
- [x] **P0** Add edge-case tests.
- [x] **P1** Add decision audit/debug information.

## Important

HULUM must not present the result as a guarantee of admission, employment, funding, or acceptance.

---

# 14. Phase 10 — AI / Claude Integration

AI is an assistant, not the eligibility authority.

## AI may

- [x] Understand natural language.
- [x] Extract structured profile information.
- [x] Explain an existing decision.
- [x] Explain requirement gaps.
- [x] Generate readiness plans.
- [x] Answer contextual product questions.
- [x] Assist multilingual interaction.
- [x] Rephrase explanations for the user's language.

## AI must not

- [x] Invent official opportunity requirements.
- [x] Invent deadlines.
- [x] Override deterministic decision rules.
- [x] Convert uncertainty into false certainty.
- [x] Claim official eligibility confirmation.
- [x] Replace the official opportunity source.

## Tasks

- [x] **P0** Select/configure Claude provider.
- [x] **P0** Define AI service.
- [x] **P0** Define structured output schema.
- [x] **P0** Implement output validation.
- [x] **P0** Implement decision-aware explanation.
- [x] **P0** Implement readiness-plan generation.
- [x] **P0** Implement contextual Q&A.
- [x] **P1** Add retry/fallback behavior.
- [x] **P1** Track latency/errors.
- [x] **P1** Create evaluation examples.

---

# 15. Phase 11 — Readiness Engine

The readiness layer tells the user what to prepare after the decision.

Example checklist:

```text
CV                    TODO
Portfolio             TODO
Motivation statement  TODO
Recommendation letter TODO
Transcript             TODO
Deadline verification  TODO
```

## Tasks

- [x] **P0** Define readiness item schema.
- [x] **P0** Generate requirements from opportunity data.
- [x] **P0** Generate readiness checklist.
- [x] **P0** Support TODO.
- [x] **P0** Support IN_PROGRESS.
- [x] **P0** Support DONE.
- [x] **P0** Support NOT_REQUIRED.
- [x] **P0** Display next action.
- [x] **P1** Allow manual checklist updates.
- [x] **P1** Generate personalized readiness plan with AI.

---

# 16. Phase 12 — Voxide Voice Integration

Voice is a required product feature.

It must perform meaningful HULUM actions and must not be decorative.

- [x] **P0** Study Voxide integration requirements.
- [x] **P0** Create development integration.
- [-] **P0** Receive/process voice input. <!-- live mic / STT; text path is separate -->
- [x] **P0** Connect voice to HULUM actions. <!-- widget tools + text → POST /api/voice/action -->
- [-] **P0** Produce voice response. <!-- TTS; text reply shipped -->
- [x] **P0** Analyze an opportunity by voice. <!-- via text/widget tools calling the same action API -->
- [x] **P0** Ask "Why?"
- [x] **P0** Ask "What am I missing?"
- [x] **P0** Ask "What should I prepare?"
- [x] **P0** Filter/show opportunities by decision.
- [x] **P1** Create/update profile by voice.
- [x] **P1** Handle recognition failure.
- [x] **P1** Handle silence/timeouts.
- [x] **P1** Support repeat requests.
- [x] **P1** Measure latency.

## Example voice intents

```text
"Should I apply for this?"
→ analyze current opportunity

"Why did you say apply?"
→ explain decision

"What am I missing?"
→ show NOT_MET / UNCERTAIN requirements

"What should I prepare?"
→ show readiness checklist

"Show me opportunities I should apply for."
→ filter APPLY

"Show me maybe opportunities."
→ filter MAYBE
```

---

# 17. Phase 13 — Multilingual Support

Initial target:

- English
- Amharic
- Afaan Oromo

Actual support depends on Voxide capabilities and quality.

- [x] **P0** Verify Voxide supported languages. <!-- voxide-languages.md; no live mic proof -->
- [x] **P0** Define language architecture.
- [x] **P0** Implement language selection.
- [x] **P0** Test one language end-to-end. <!-- English Ask HULUM text path; not live STT -->
- [x] **P0** Ensure core voice interaction works. <!-- text/quick actions + optional widget tools; live mic still open -->
- [x] **P1** Add second language. <!-- Amharic Ask HULUM text UX; not live Amharic STT -->
- [ ] **P1** Add third language if stable. <!-- Afaan Oromo UI/voice open (ADR 004) -->
- [x] **P1** Test mixed-language input. <!-- English + Amharic text keywords; not dual-language STT -->
- [x] **P1** Test opportunity terminology.
- [x] **P1** Test decision explanations.

Do not trade reliability for language count.

---

# 18. Phase 14 — Backend

- [x] **P0** Server foundation.
- [x] **P0** Environment configuration.
- [x] **P0** Database connection.
- [x] **P0** Profile service.
- [x] **P0** Opportunity service.
- [x] **P0** Requirement matching service.
- [x] **P0** Decision service.
- [x] **P0** Readiness service.
- [x] **P0** AI orchestration service.
- [x] **P0** Voice integration service.
- [x] **P1** Search/filter service.
- [x] **P1** Audit/debug service.

## Suggested endpoints

```text
POST   /api/profile
GET    /api/profile
PATCH  /api/profile

GET    /api/opportunities
GET    /api/opportunities/:id

POST   /api/opportunities/:id/analyze
GET    /api/opportunities/:id/readiness

POST   /api/ai/explain
POST   /api/ai/profile-extract

POST   /api/voice/session
POST   /api/voice/intent

GET    /api/health
```

- [x] **P0** Define API contracts before integration.
- [x] **P0** Implement profile endpoints.
- [x] **P0** Implement opportunity endpoints.
- [x] **P0** Implement analysis endpoint.
- [x] **P0** Implement readiness endpoint.
- [x] **P0** Implement health endpoint.
- [x] **P1** Add validation/rate limiting/documentation.

---

# 19. Phase 15 — Database

Recommended MVP data:

```text
profiles
opportunities
opportunity_requirements
analyses
requirement_matches
readiness_items
voice_sessions
```

Optional if needed:

```text
users
audit_logs
```

- [x] **P0** Design schema.
- [x] **P0** Create migrations.
- [x] **P0** Persist profiles.
- [x] **P0** Persist opportunities.
- [x] **P0** Persist requirements.
- [x] **P0** Persist analyses.
- [x] **P0** Persist readiness state.
- [x] **P1** Add indexes.
- [x] **P1** Add security policies/RLS where applicable. <!-- RLS in 004+; API connects as table owner until non-owner role -->
- [x] **P1** Define retention strategy.

---

# 20. Phase 16 — Shared Contracts

Frontend and backend must use shared contracts.

- [x] **P0** Define profile type.
- [x] **P0** Define opportunity type.
- [x] **P0** Define requirement type.
- [x] **P0** Define requirement status enum.
- [x] **P0** Define decision enum.
- [x] **P0** Define analysis response.
- [x] **P0** Define readiness item.
- [x] **P0** Define voice intent/result.
- [x] **P1** Add runtime validation.

## Core analysis contract

```text
Analysis
├── decision
├── fitScore
├── matchedRequirements
├── missingRequirements
├── uncertainRequirements
├── explanation
├── readinessItems
├── nextAction
└── officialSource
```

---

# 21. Phase 17 — Frontend

## User experience

- [x] **P0** Landing/home.
- [x] **P0** Profile setup.
- [x] **P0** Opportunity list.
- [x] **P0** Opportunity detail.
- [x] **P0** Analyze action.
- [x] **P0** Decision result.
- [x] **P0** Requirement breakdown.
- [x] **P0** Readiness checklist.
- [-] **P0** Voice interaction. <!-- live mic; Ask HULUM text/quick actions are shipped -->
- [x] **P0** Official source/application action.
- [x] **P1** Search/filter.
- [x] **P1** Error states.
- [x] **P1** Network fallback.
- [x] **P1** Accessibility polish.

## UI principle

The user should understand the result quickly:

```text
APPLY
You meet the key requirements.

Why:
✓ Ethiopian eligibility
✓ Computer Science
✓ Graduation year
✓ Required experience

Prepare:
□ CV
□ Motivation statement

Next:
Verify the official deadline and apply.
```

---

# 22. Phase 18 — Contextual Assistant

The assistant should remain grounded in the current HULUM context.

- [x] **P0** Ask why a decision was made.
- [x] **P0** Ask what is missing.
- [x] **P0** Ask what to prepare.
- [x] **P0** Ask about the current opportunity.
- [x] **P1** Ask about profile gaps.
- [x] **P1** Ask to filter opportunities.
- [x] **P1** Ask for clarification of requirements.

The assistant must not become an unrestricted chatbot.

---

# 23. Phase 19 — Security

- [x] **P0** Protect API keys.
- [x] **P0** Never commit `.env`.
- [x] **P0** Validate incoming data.
- [x] **P0** Sanitize logs.
- [x] **P0** Protect database access.
- [x] **P0** Protect admin/debug routes if any.
- [x] **P1** Add authentication if required. <!-- JWT + optional Google; no password-reset email/OTP -->
- [x] **P1** Add authorization if required. <!-- JWT session scopes owned routes; not email OTP -->
- [x] **P1** Review data exposure.
- [x] **P1** Review retention.

Never commit:

- Claude API keys
- Voxide credentials
- Supabase secrets
- Database credentials
- Access tokens

---

# 24. Phase 20 — Testing

## Unit tests

- [x] Profile validation.
- [x] Requirement matching.
- [x] Requirement status calculation.
- [x] APPLY decision.
- [x] MAYBE decision.
- [x] SKIP decision.
- [x] Edge cases.
- [x] Readiness generation.
- [x] AI output validation.
- [x] Voice intent mapping.

## Integration tests

- [x] Profile → backend.
- [x] Opportunity → backend.
- [x] Profile + opportunity → analysis.
- [x] Analysis → decision.
- [x] Decision → explanation.
- [x] Decision → readiness.
- [x] Voice → intent.
- [x] Voice intent → HULUM action.
- [x] Frontend → backend.
- [x] Backend → database.

## End-to-end

- [x] Create profile.
- [x] Browse opportunity.
- [x] Open opportunity.
- [x] Analyze.
- [x] Receive APPLY/MAYBE/SKIP.
- [x] Ask why.
- [x] View missing requirements.
- [x] View readiness.
- [x] Use voice.
- [x] Open official application source.

## Failure tests

- [x] Microphone unavailable.
- [x] Speech recognition failure.
- [x] Voxide failure.
- [x] Claude timeout.
- [x] Malformed AI response.
- [x] Database failure.
- [x] Network interruption.
- [x] Missing profile information.
- [x] Contradictory profile information.
- [x] Uncertain requirement.
- [x] Expired opportunity.
- [x] Unsupported voice request.

---

# 25. Phase 21 — Voice Failure Fallback

The product must remain usable when voice fails.

- [x] **P0** Detect voice failure.
- [x] **P0** Show text-input fallback.
- [x] **P0** Keep quick actions available.
- [x] **P1** Show retry action.
- [x] **P1** Explain failure clearly.
- [x] **P1** Avoid trapping the user in voice mode.

Fallback:

```text
Voice unavailable
      ↓
Text input
      +
Quick actions
      +
Normal HULUM UI
```

---

# 26. Phase 22 — Observability

Track useful technical signals without unnecessarily storing sensitive content.

- [x] **P1** API latency.
- [x] **P1** AI latency.
- [x] **P1** Voice latency.
- [x] **P1** API error rates.
- [x] **P1** AI validation failures.
- [x] **P1** Voice recognition failures.
- [x] **P1** Decision-engine errors.
- [x] **P1** Session failures.

Do not log unnecessary personal profile data or raw voice/conversation content.

---

# 27. Phase 23 — Deployment

- [ ] **P0** Deploy frontend.
- [ ] **P0** Deploy backend.
- [x] **P0** Configure production environment.
- [x] **P0** Configure database.
- [x] **P0** Configure CORS.
- [x] **P0** Configure production secrets.
- [ ] **P0** Verify production analysis flow.
- [ ] **P0** Verify production voice flow.
- [ ] **P1** Deploy on EthioDeploy if practical.
- [x] **P1** Document deployment decision.

EthioDeploy is optional. Documented as **not deployed** (`docs/stark/deployment.md`). Do not mark deploy done without a real host.

---

# 28. Phase 24 — CI/CD

- [x] **P1** Configure GitHub Actions.
- [x] **P1** Install dependencies.
- [x] **P1** Type check.
- [x] **P1** Lint.
- [x] **P1** Run tests.
- [x] **P1** Build frontend.
- [x] **P1** Build backend.
- [ ] **P1** Block merges when checks fail. <!-- admin: docs/ops/branch-protection.md -->
- [x] **P1** Configure deployment workflow if appropriate. <!-- N/A — deployment.md; ci.yml has no deploy job -->

---

# 29. Phase 25 — Demo Engineering

Use one strong user story, not a feature dump.

## Recommended demo persona

```text
Ethiopian university student
Field: Computer Science
Graduation: 2027
Skills: Python, React
Experience: 1 internship
Languages: English + Amharic
Interest: AI
```

## Demo flow

- [x] **P0** Create demo profile.
- [x] **P0** Show opportunity.
- [x] **P0** Ask HULUM to analyze.
- [x] **P0** Show APPLY/MAYBE/SKIP.
- [x] **P0** Explain why.
- [x] **P0** Show matched requirements.
- [x] **P0** Show missing/uncertain requirements.
- [x] **P0** Show readiness checklist.
- [x] **P0** Demonstrate Ask HULUM text / quick actions (same product actions as voice tools).
- [ ] **P0** Demonstrate live microphone / Voxide STT (needs keyed mic pass).
- [x] **P0** Demonstrate English.
- [x] **P1** Demonstrate Amharic text UX if stable (not live Amharic STT).
- [x] **P0** Open official opportunity source.
- [x] **P0** Show responsible-AI notice.
- [x] **P1** Demonstrate a MAYBE case (when catalog / fixtures allow; not seeded triangle).
- [x] **P1** Demonstrate a SKIP case (when catalog / fixtures allow; not seeded triangle).
- [x] **P0** Prepare backup mode for external-service failure.
- [x] **P0** Test clean browser/device (`smoke:browser` on CI).
- [ ] **P0** Test microphone.
- [ ] **P0** Test production deployment.
- [ ] **P1** Prepare backup video/screenshots.

---

# 30. Phase 26 — Documentation

- [x] **P0** README.
- [x] **P0** Product overview.
- [x] **P0** Architecture overview.
- [x] **P0** Setup guide.
- [x] **P0** Environment variables.
- [x] **P0** API contracts.
- [x] **P0** Database model.
- [x] **P0** Decision-engine documentation.
- [x] **P0** AI architecture.
- [x] **P0** Voice architecture.
- [x] **P0** Research/competitive analysis.
- [x] **P0** ScholarXIV ideation evidence.
- [x] **P1** Architecture decision records.
- [x] **P1** Demo instructions.
- [x] **P1** Deployment guide.
- [x] **P1** STARK evidence checklist.

---

# 31. Phase 27 — STARK Evidence

The build must leave truthful evidence of development.

- [x] **P0** Preserve GitHub history.
- [x] **P0** Use real commits.
- [x] **P0** Keep meaningful changelog entries.
- [x] **P0** Document major product decisions.
- [x] **P0** Document rejected ideas.
- [x] **P0** Document iteration.
- [x] **P0** Keep research evidence.
- [x] **P0** Keep implementation progress visible.
- [x] **P0** Keep team contribution traceable.
- [x] **P1** Add milestone tags.
- [x] **P1** Prepare final development narrative.

Never manufacture commits, dates, research activity, or progress.

---

# 32. 20-Day Execution Plan

## Days 1–2 — Foundation + Research

- [x] Repository foundation.
- [x] Team workflow.
- [x] Product/problem documentation.
- [x] ScholarXIV setup.
- [x] Competitive research.
- [x] Architecture confirmation.

## Days 3–4 — Data + Profile

- [x] Database schema.
- [x] Shared contracts.
- [x] Profile API.
- [x] Profile UI.
- [x] Opportunity schema.
- [x] Demo opportunity seeds.

## Days 5–7 — Decision Engine

- [x] Requirement model.
- [x] Requirement matching.
- [x] APPLY/MAYBE/SKIP.
- [x] Analysis API.
- [x] Analysis UI.
- [x] Unit tests.

## Days 8–9 — Readiness

- [x] Readiness schema.
- [x] Checklist generation.
- [x] Readiness UI.
- [x] Next-action behavior.
- [x] Integration tests.

## Days 10–12 — Voice

- [x] Voxide integration.
- [x] Voice session.
- [x] Voice intent mapping.
- [x] Voice → analysis.
- [x] Voice → explanation.
- [x] Voice → readiness.
- [x] Voice → gaps.
- [x] Voice → filter by decision.
- [x] Voice fallback.
- [x] First stable language end-to-end.

## Days 13–14 — AI + Multilingual

- [x] Claude explanation.
- [x] Structured AI output validation.
- [x] Contextual assistant.
- [x] Amharic text UX if stable (not live Amharic STT).
- [ ] Afaan Oromo if stable and quality is acceptable.

## Days 15–16 — Integration

- [x] Full profile → opportunity → analysis flow.
- [x] Full analysis → readiness flow.
- [x] Full Ask HULUM text / voice-tool flow (live mic STT/TTS still open).
- [x] Error handling.
- [x] Security review.
- [x] Production configuration.

## Days 17–18 — Deployment + Testing

- [ ] Deploy.
- [ ] Production voice test.
- [x] E2E testing.
- [x] Failure testing.
- [x] Browser/device testing.
- [x] Fix critical bugs.

## Day 19 — Demo + Documentation

- [x] Demo script.
- [x] STARK documentation.
- [x] Research evidence.
- [x] Changelog review.
- [x] README review.
- [x] Architecture review.
- [x] Backup demo.

## Day 20 — Freeze

- [x] No unnecessary new features.
- [x] Final bug fixes only.
- [ ] Final production test.
- [x] Final Git history review.
- [x] Final task status.
- [x] Final changelog.
- [x] Final demo rehearsal.
- [x] Final STARK submission package.

---

# 33. MVP Definition

The HULUM MVP requires these capabilities to work together:

- [x] **P0** User profile.
- [x] **P0** Opportunity data.
- [x] **P0** Requirement matching.
- [x] **P0** APPLY/MAYBE/SKIP decision.
- [x] **P0** Decision explanation.
- [x] **P0** Missing/uncertain requirements.
- [x] **P0** Readiness checklist.
- [ ] **P0** Voxide voice interaction. <!-- keyed mic pass still required -->
- [x] **P0** At least one stable language end-to-end. <!-- English -->
- [x] **P0** English support.
- [ ] **P0** Amharic support if Voxide quality is sufficient. <!-- Amharic text UX shipped; Voxide STT quality unverified -->
- [x] **P0** Official source/application link.
- [x] **P0** Responsible-AI notice.
- [ ] **P0** Working deployed prototype.
- [x] **P0** Failure fallback.
- [x] **P0** Documented research/ideation basis.

---

# 34. Explicitly Out of MVP

Do not allow scope creep into:

- Full social network.
- Large-scale opportunity marketplace.
- Automated application submission.
- Automatic document submission.
- Guaranteed eligibility.
- Guaranteed acceptance.
- AI-only eligibility decisions.
- Unrestricted AI career chatbot.
- Complex recruitment platform.
- Complex resume builder.
- Full LMS.
- Large enterprise integrations.
- Payment system unless explicitly required.
- Large-scale scraping infrastructure.
- Features not needed to prove the core HULUM thesis.

---

# 35. Definition of Done

A task is complete only when:

1. The implementation matches the repository specification.
2. Relevant tests pass.
3. The feature works in the agreed environment.
4. Another teammate can understand/use the implementation.
5. No secrets are committed.
6. Related documentation is updated.
7. `task.md` status is updated when appropriate.
8. `CHANGELOG.md` is updated.
9. Git history truthfully represents the work.
10. Required STARK evidence is preserved.

---

# 36. Daily Team Checklist

## Yesterday

- What did I complete?

## Today

- What am I implementing?

## Blockers

- What is preventing progress?

## Integration

- What does the other teammate need from me?

## Evidence

- What commit/PR demonstrates the work?

## STARK

- What research, decision, implementation, or iteration should be documented?

---

# 37. Priority Rule

```text
Core Decision Engine
        ↓
User Profile + Opportunity Data
        ↓
Requirement Matching
        ↓
APPLY / MAYBE / SKIP
        ↓
Readiness
        ↓
Voice
        ↓
AI Explanation
        ↓
Multilingual Expansion
        ↓
Deployment
        ↓
Polish
        ↓
Nice-to-have Features
```

However, STARK-required research and ideation documentation must be maintained throughout the build, not postponed until the end.

---

# 38. Decision Gates

## Gate 1 — Concept

- [x] Problem documented.
- [x] Research documented.
- [x] Alternatives documented.
- [x] Rejected ideas documented.
- [x] HULUM concept selected.
- [x] MVP scope defined.

## Gate 2 — Architecture

- [x] Architecture documented.
- [x] Database model documented.
- [x] Decision engine documented.
- [x] AI responsibility documented.
- [x] Voice integration approach documented.
- [x] Shared contracts documented.

## Gate 3 — Vertical Slice

- [x] Profile works.
- [x] Opportunity works.
- [x] Requirement matching works.
- [x] APPLY/MAYBE/SKIP works.
- [x] Explanation works.
- [x] Readiness works.

## Gate 4 — Voice Slice

- [ ] Voxide input works. <!-- live mic / STT -->
- [x] Voice intent works. <!-- text + widget tools → /api/voice/action -->
- [x] HULUM action executes.
- [ ] Voice response works. <!-- TTS; text reply shipped -->
- [x] Failure fallback works.

## Gate 5 — Integrated MVP

- [x] Profile → opportunity → analysis works.
- [x] Analysis → readiness works.
- [x] Voice → analysis works. <!-- via text/widget tools -->
- [x] Voice → explanation works. <!-- via text/widget tools -->
- [x] Official source link works.
- [x] Responsible-AI notice works.

## Gate 6 — Demo Ready

- [ ] Production deployment works.
- [x] Demo scenario is stable.
- [ ] Voice works. <!-- keyed live mic -->
- [x] Backup mode exists.
- [x] Documentation is complete.
- [x] Git history is truthful.
- [x] STARK evidence is ready.

---

# 39. Cursor Build Rule

Cursor must treat the repository documentation as the source of truth.

The correct execution loop is:

```text
Repository MD
    ↓
Read task.md
    ↓
Inspect current code
    ↓
Find next dependency-safe task
    ↓
Check ownership
    ↓
Plan
    ↓
Implement ONE task
    ↓
Test
    ↓
Update docs
    ↓
Update CHANGELOG
    ↓
Review Git diff
    ↓
Commit
    ↓
Next task
```

Cursor must not:

- Invent a different architecture.
- Skip dependencies.
- Build unrelated features.
- Rewrite project documentation without reason.
- Manufacture Git history.
- Commit secrets.
- Assume a task is complete without checking the repository.
- Start the next task before the current task is verified.

---

# 40. Final Product Principle

> Build the smallest system that convincingly proves the core thesis: an Ethiopian student or young professional can use HULUM to evaluate an opportunity, understand whether it is worth pursuing, see what is missing, and know exactly what to prepare next — with meaningful voice interaction and a clear path to the official opportunity source.

---

# 41. Version History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-09-18 | Adapted master task-management structure for HULUM |
| 1.1 | 2026-09-29 | Added Task 49 (Kidist): product UI transformation |
