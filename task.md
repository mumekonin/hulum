# HULUM — Individual Team Assignments

**Project:** HULUM — AI Opportunity Decision & Readiness Agent  
**Team:** Kidist + Mulualem  
**Hackathon:** STARK Hackathon 2026  
**Schedule:** 20-day compressed build  
**Version:** 1.0

## Task tracker

Status is marked DONE in the same PR as the work, so `main` shows DONE only after merge.

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
| 34 | Opportunity verification | Mulualem | DONE |
| 35 | API security and validation | Mulualem | DONE |

Other tasks are not started.

This document adapts the attached team-assignment format to HULUM. Each engineering
vertical has one accountable owner; shared contracts, research, integration, testing,
and final demo work are done together.

## HULUM Product Boundary

```text
User Profile
     ↓
Opportunity
     ↓
Requirement Matching
     ↓
APPLY / MAYBE / SKIP
     ↓
Why?
     ↓
Matched / Missing / Uncertain
     ↓
Readiness Checklist
     ↓
Next Action
     ↓
Official Source
```

Voice is a real product capability:

```text
Voice → Voxide → Intent → HULUM Action → Structured Result → Voice/Text Response
```

Claude assists with natural-language understanding, explanations, profile extraction,
and readiness language. The deterministic requirement and decision engine remains the
source of truth for APPLY/MAYBE/SKIP.

---

# Kidist — Product / Frontend / Mobile / Voice UX

Kidist owns the user-facing product experience, web application, mobile application,
voice interaction UX, product documentation, research evidence, and demo presentation.

### Task 1 — Product flow & UX map (Days 1–2)
**Depends on:** problem definition and initial research.

> Map the complete HULUM journey from profile creation through opportunity discovery,
> analysis, APPLY/MAYBE/SKIP, explanation, missing requirements, readiness, and the
> official application source.

**Verify:** both teammates can walk through the complete flow before main implementation.

### Task 2 — Research & ScholarXIV evidence (Days 1–4)
**Shared with:** Mulualem — done together, one canonical research record.

> Document evidence about opportunity-access barriers, eligibility uncertainty,
> responsible AI, multilingual access, voice interaction, and application readiness.

**Verify:** major product assumptions are traceable to research, an engineering decision,
or a clearly labeled hypothesis.

### Task 3 — Ideation & rejected ideas (Days 1–3)
**Shared with:** Mulualem.

> Record the original problem, alternatives considered, rejected ideas, reasons for
> rejection, and the evolution toward HULUM's APPLY/MAYBE/SKIP model.

**Verify:** a judge can understand why HULUM was selected and how the idea evolved.

### Task 4 — Web application scaffold (Days 2–4)
**Depends on:** Task 1.

> Set up Next.js + TypeScript + Tailwind with routes and reusable components for
> profile, opportunities, analysis, readiness, and voice.

**Verify:** the app builds and primary routes render without crashing.

### Task 5 — HULUM design system (Days 2–4)
**Depends on:** Task 1.

> Define typography, spacing, cards, buttons, requirement indicators, decision states,
> checklist components, responsive behavior, and accessible interaction patterns.

**Verify:** core screens use consistent components rather than arbitrary styling.

### Task 6 — Profile UI (Days 3–5)
**Depends on:** Task 4 and shared profile contract.

> Build profile creation/editing for education, field, graduation year, location,
> skills, experience, languages, and interests.

**Verify:** a profile can be created and updated through the real API.

### Task 7 — Opportunity browsing UI (Days 4–6)
**Depends on:** Task 4 and Mulualem's opportunity API.

> Build opportunity list, cards, filters, deadline display, verification indicator,
> and detail view.

**Verify:** users can browse real structured opportunities and open details.

### Task 8 — Analysis result UI (Days 6–9)
**Depends on:** Task 7 and decision-engine contract.

> Make APPLY/MAYBE/SKIP visually dominant. Show fit signal, reasons, matched,
> missing, uncertain requirements, and next action.

**Verify:** a user understands the decision without reading raw AI output.

### Task 9 — Readiness checklist UI (Days 8–10)
**Depends on:** analysis contract.

> Display preparation items such as CV, portfolio, motivation statement,
> recommendation letter, transcript, and deadline verification.

**Verify:** users can see what is done, missing, in progress, or not required.

### Task 10 — Official source/application flow (Days 8–10)
**Depends on:** opportunity model.

> Add official source/application links and the HULUM verification/uncertainty notice.

**Verify:** the demo can move directly from HULUM analysis to the official source.

### Task 11 — Voice interaction UX (Days 9–13)
**Depends on:** Voxide integration contract.

> Implement listening, processing, responding, retry, timeout, unsupported-request,
> and text/quick-action fallback states.

Core intents:

```text
ANALYZE_OPPORTUNITY
EXPLAIN_DECISION
SHOW_MISSING_REQUIREMENTS
SHOW_READINESS
FILTER_OPPORTUNITIES
OPEN_OPPORTUNITY
UPDATE_PROFILE
```

**Verify:** voice triggers real HULUM actions, not a decorative chatbot.

### Task 12 — Amharic voice UX (Days 11–14)
**Depends on:** Task 11 and Voxide capability verification.

> Test meaningful Amharic interaction, terminology, response clarity, and fallback.

**Verify:** at least one important HULUM action works through tested Amharic voice
when the provider integration is stable.

### Task 13 — Afaan Oromo validation (Days 12–15)
**Depends on:** Voxide capability and stable voice flow.

> Validate Afaan Oromo where technically available; do not add unreliable translation
> simply to increase language count.

**Verify:** supported interactions preserve meaning and do not break the UI.

### Task 14 — Mobile application core (Days 10–16)
**Depends on:** stable API contracts.

> Build React Native profile, opportunity, analysis, decision, readiness, and voice
> flows using the same backend contracts.

**Verify:** the core HULUM journey works on the target mobile demo device.

### Task 15 — Frontend failure handling (Days 14–16)
**Depends on:** integrated frontend.

> Handle API failure, incomplete profile, empty data, AI failure, voice timeout,
> microphone failure, network interruption, and stale data.

**Verify:** each major failure has a recovery path or clear next action.

### Task 16 — Responsive/accessibility review (Days 16–17)
**Depends on:** integrated UI.

> Review mobile/desktop layouts, contrast, touch targets, keyboard use, and decision
> clarity. Essential information must not depend only on color.

**Verify:** the main flow remains usable on target demo devices.

### Task 17 — Demo/presentation design (Days 17–19)
**Depends on:** integrated MVP.

> Prepare screenshots, architecture visuals, user-flow visuals, demo script, and
> STARK presentation assets.

**Verify:** the HULUM story can be understood without reading source code.

### Task 18 — Final frontend/demo build (Day 19)
**Depends on:** final integration.

> Remove development-only UI and prepare the stable production/demo build.

**Verify:** clean-browser/device demo works without manual database intervention.

### Task 19 — Final UX sign-off (Day 20)
**Coordinates:** whole team.

> Review HULUM as a first-time opportunity seeker and identify only high-value final
> changes affecting clarity, reliability, or the demo.

**Verify:** no critical UX confusion remains.

---

# Mulualem — Backend / Database / Decision Engine / AI / Voice

Mulualem owns the Express backend, PostgreSQL/Supabase layer, requirement matching,
APPLY/MAYBE/SKIP engine, Claude integration, Voxide backend integration, API contracts,
testing, and deployment.

### Task 20 — Backend platform scaffold (Days 1–2)
**Depends on:** nothing.

> Set up Express + TypeScript modules for profiles, opportunities, requirements,
> analysis, readiness, AI, voice, security, and common services. Add `/api/health`.

**Verify:** server starts, health check responds, and secrets are excluded from Git.

### Task 21 — Database schema v1 (Days 1–3)
**Depends on:** Task 20 and shared model.

> Define PostgreSQL/Supabase models for `profiles`, `opportunities`, `requirements`,
> `analyses`, and `readiness_items`; optionally voice sessions/events.

**Verify:** migrations run cleanly and records can be persisted/retrieved.

### Task 22 — Shared TypeScript contracts (Days 1–3)
**Shared with:** Kidist — live, done together.

Define:

```text
Profile
Opportunity
Requirement
RequirementStatus
Decision
Analysis
ReadinessItem
VoiceIntent
VoiceResponse
APIError
```

**Verify:** web, mobile, and backend use one agreed contract.

### Task 23 — Opportunity service (Days 3–5)
**Depends on:** Tasks 21–22.

> Implement opportunity retrieval, structured requirements, verification status,
> source metadata, last-verified timestamp, and official application URL.

**Verify:** frontend can retrieve real structured opportunities.

### Task 24 — Profile service (Days 3–5)
**Depends on:** Tasks 21–22.

> Implement profile create/read/update/validation and completeness handling.

**Verify:** profile data can be created through the API and used by analysis.

### Task 25 — Requirement matching engine (Days 4–7)
**Depends on:** Tasks 23–24.

> Compare structured profile facts with structured opportunity requirements.

Statuses:

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

> Integrate voice processing and supported language handling.

**Verify:** a real voice request can trigger a real HULUM action.

### Task 33 — Voice intent/action service (Days 11–14)
**Depends on:** Task 32.

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

Test:

```text
Profile → Opportunity → Analysis → Matching → Decision → Claude → Readiness → Voice → UI
```

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

---

# Shared Team Tasks

### Task 39 — Problem definition (Days 1–2)
**Shared with:** Kidist + Mulualem.

> Establish the exact problem HULUM solves: users need help deciding whether an
> opportunity is worth pursuing, what they are missing, and what to prepare—not only
> where opportunities exist.

**Verify:** both teammates can explain the problem consistently.

### Task 40 — ScholarXIV research trail (Days 1–5)
**Shared with:** whole team.

> Preserve research queries, findings, relevant papers, and the product decisions
> influenced by the evidence.

**Verify:** the ideation story is reproducible from repository evidence.

### Task 41 — Competitive analysis (Days 2–5)
**Shared with:** whole team.

> Review Ethiopian and global opportunity platforms, scholarship matching products,
> AI opportunity tools, and voice-first systems. Record capabilities, limitations,
> evidence, and HULUM's intended distinction.

**Verify:** the team can explain differentiation without claiming competitors do not exist.

### Task 42 — Architecture decision record (Days 2–4)
**Shared with:** whole team.

> Document why HULUM uses Next.js, React Native, Express/TypeScript, PostgreSQL/Supabase,
> Claude, and Voxide, plus important alternatives considered.

**Verify:** technology decisions are intentional and traceable.

### Task 43 — First vertical slice (Days 6–10)
**Coordinates:** Kidist + Mulualem.

> Complete one real flow:

```text
Profile → Opportunity → Analyze → Matching → APPLY/MAYBE/SKIP
→ Why? → Missing/Uncertain → Readiness → Official Source
```

**Verify:** web/backend/database/decision logic work together with real data.

### Task 44 — Voice vertical slice (Days 11–14)
**Coordinates:** Kidist + Mulualem.

> Complete:

```text
User voice → Voxide → Intent → HULUM action → Structured result → Voice/Text response
```

**Verify:** at least one meaningful voice command works repeatedly.

### Task 45 — Failure review (Days 14–17)
**Shared with:** whole team.

Test incomplete profiles, ambiguous requirements, stale opportunities, missing sources,
Claude timeout/malformed output, Voxide failure, recognition failure, network failure,
and unsupported intents.

**Verify:** failures have deterministic recovery behavior and do not invent eligibility facts.

### Task 46 — Demo rehearsal (Days 18–20)
**Shared with:** whole team.

> Run the same production scenario repeatedly and record/fix only issues affecting
> reliability, clarity, or the demo.

**Verify:** no manual database or developer intervention is required.

### Task 47 — Final STARK documentation package (Day 20)
**Shared with:** whole team.

Ensure evidence exists for:

```text
Problem
Research
ScholarXIV
Ideation + rejected ideas
Competitors
Product requirements
Architecture
Database
Decision engine
AI responsibility
Voice UX
Implementation
Testing
Iteration
Deployment
Demo
Changelog
Git history
```

**Verify:** a judge can follow HULUM from problem → research → decisions → implementation → working product.

---

# Dependency Order

```text
Problem + Research
      ↓
Product / UX map
      ↓
Repository + Architecture
      ↓
Shared contracts
      ↓
Database
      ↓
Profile + Opportunity
      ↓
Requirement Matching
      ↓
APPLY/MAYBE/SKIP
      ↓
Analysis API
      ↓
Readiness
      ↓
Claude explanation
      ↓
Web integration
      ↓
Voxide
      ↓
Voice actions
      ↓
Mobile core
      ↓
Integration testing
      ↓
Failure testing
      ↓
Deployment
      ↓
Final demo
```

---

# Ownership Summary

| Area | Owner | Backup / Contributor |
|---|---|---|
| Product definition | Kidist | Mulualem |
| UX / design system | Kidist | Mulualem |
| Web frontend | Kidist | Mulualem |
| Mobile frontend | Kidist | Mulualem |
| Voice UX | Kidist | Mulualem |
| Research / ScholarXIV | Kidist + Mulualem | — |
| Backend | Mulualem | Kidist |
| Database | Mulualem | Kidist |
| Opportunity API | Mulualem | Kidist |
| Profile API | Mulualem | Kidist |
| Requirement matching | Mulualem | Kidist |
| APPLY/MAYBE/SKIP | Mulualem | Kidist |
| Fit score | Mulualem | Kidist |
| Readiness engine | Mulualem | Kidist |
| Claude integration | Mulualem | Kidist |
| AI validation | Mulualem | Kidist |
| Voxide integration | Mulualem | Kidist |
| Security | Mulualem | Kidist |
| Testing | Kidist + Mulualem | — |
| Deployment | Mulualem | Kidist |
| Demo | Kidist + Mulualem | — |
| STARK documentation | Kidist + Mulualem | — |

---

# 20-Day Responsibility Schedule

| Days | Kidist | Mulualem | Shared |
|---|---|---|---|
| 1–2 | UX map, product definition | Backend foundation | Problem + research |
| 3–4 | Web scaffold, design system | DB + contracts | Ideation + architecture |
| 5–6 | Profile + opportunity UI | Profile/opportunity API | Data validation |
| 7–8 | Analysis UI | Matching + decision engine | Decision tests |
| 9–10 | Readiness UI | Analysis API + readiness | First vertical slice |
| 11–12 | Voice UX | Claude + Voxide | Voice contract |
| 13–14 | Voice + Amharic UX | Voice intent/action | Voice vertical slice |
| 15–16 | Mobile core | Security + verification | Integration testing |
| 17 | Accessibility/responsive | Production hardening | Failure review |
| 18 | Demo assets | Deployment verification | Demo rehearsal |
| 19 | Final frontend/mobile | Final backend | Documentation freeze |
| 20 | UX/demo sign-off | Technical sign-off | Final demo + STARK package |

---

# Working Rules

1. Owner means accountable, not isolated; either teammate may contribute.
2. Shared contracts are agreed before dependent implementation.
3. No silent API, database, decision, or voice-contract changes.
4. The deterministic engine is the source of truth for APPLY/MAYBE/SKIP.
5. Claude explains and assists; it does not silently override structured facts or official requirements.
6. Voxide voice must trigger real HULUM functionality.
7. Official opportunity sources remain the final authority for eligibility and deadlines.
8. Integrate early; do not wait until the last days.
9. Build one vertical slice before expanding scope.
10. Document major product and architecture decisions.
11. Git history and changelog must represent actual work.
12. When time is limited, protect the core HULUM decision flow.

# Definition of Done

```text
Implementation + Verification/Test + Documentation + Git Commit
+ PR Review + Integration + STARK Evidence = DONE
```

# Final Team Principle

> **Kidist owns the experience users see. Mulualem owns the systems and decision logic underneath it. Both own research, integration, evidence, and the final product.**

# Final One-Line Rule

> **Build together at the contracts, build independently at ownership boundaries, integrate continuously, and make every commit, changelog entry, research note, and demo step tell the true story of how HULUM was built.**
