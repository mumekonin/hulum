# HULUM — AI Opportunity Decision & Readiness Agent
## STARK Official Hackathon 2026 — Complete v0.1 Build Specification

**Team:** Kidist + Mulualem  
**Official hackathon period:** September 9 – October 2, 2026  
**Working constraint:** Maximum 20-day execution plan  
**Version:** v0.1  
**Status:** BUILD SPECIFICATION / MVP LOCK

---

# 0. Executive Decision

HULUM is the project we are locking for the hackathon.

> **HULUM helps Ethiopian students and young professionals decide which opportunities are worth applying to, why, what they are missing, and what to do next.**

HULUM is **not** another opportunity-listing website.

Core loop:

```text
User Profile
    ↓
Opportunity
    ↓
Eligibility / Fit Analysis
    ↓
APPLY / MAYBE / SKIP
    ↓
Why?
    ↓
Gap Analysis
    ↓
Readiness Checklist
    ↓
Voice Interaction
```

The supplied HULUM concept defines it as a voice-first opportunity decision and readiness agent for Ethiopian students and young professionals. It evaluates scholarships, fellowships, internships, jobs, grants, and competitions against a user's profile and returns APPLY, MAYBE, or SKIP. fileciteturn5file0L10-L35

---

# 1. Problem

Ethiopian students and young professionals encounter opportunities through Telegram, Facebook, websites, organizations, and other channels.

The target problem is not simply discovering opportunities. It is deciding:

- Am I actually eligible?
- Is this worth my time?
- What am I missing?
- What should I prepare first?
- Should I apply or skip?

The supplied concept explicitly frames the barrier as **decision rather than discovery**. fileciteturn5file1L120-L137

---

# 2. Solution

HULUM creates a structured user profile and compares it against structured opportunity requirements.

It produces:

```text
APPLY
MAYBE
SKIP
```

with:

- fit score
- matched requirements
- missing requirements
- explanation
- next action
- readiness checklist
- official source
- voice interaction

The signature mechanic is intentionally simple and memorable. fileciteturn5file1L138-L149

---

# 3. Product Positioning

## One-line

> **HULUM is your AI opportunity decision agent.**

## Full

> HULUM evaluates opportunities against your personal profile and tells you whether to APPLY, MAYBE, or SKIP — then explains why and tells you what to do next.

## Do not position HULUM as

- a generic chatbot
- only a scholarship directory
- only an opportunity scraper
- an official eligibility authority
- a system guaranteeing acceptance

---

# 4. Target Users

## Primary

- Ethiopian university students
- recent graduates
- scholarship seekers
- internship seekers
- fellowship seekers
- remote-job seekers

## Secondary

- young professionals
- grant seekers
- accelerator applicants
- people pursuing international career transitions

These audiences are specified in the supplied HULUM concept. fileciteturn5file0L36-L40

---

# 5. Core Product Principles

1. **Decision over discovery.**
2. **Explain every decision.**
3. **Show uncertainty instead of pretending certainty.**
4. **Prefer official sources.**
5. **Voice must perform real product actions.**
6. **Amharic is a first-class experience.**
7. **Structured evidence should support the AI explanation.**
8. **Reliability comes before feature count.**
9. **Research and product decisions must be traceable.**
10. **The final product must tell one consistent story from ideation to implementation.**

---

# 6. MVP Scope

## P0 — Must Have

### 6.1 User Profile

Fields:

```text
name
education_level
field_of_study
graduation_year
country
location
skills
experience
languages
interests
```

The source concept specifically proposes a voice profile setup where HULUM structures a user's spoken background. fileciteturn5file0L41-L55

---

### 6.2 Opportunity Database

Each opportunity:

```text
id
title
organization
type
description
deadline
country_eligibility
education_requirements
field_requirements
experience_requirements
language_requirements
document_requirements
other_requirements
application_url
source_url
source_type
verification_status
last_verified_at
created_at
updated_at
```

Initial MVP:

> **10–20 carefully curated opportunities**

Quality and verification matter more than quantity.

---

### 6.3 Opportunity Details

Show:

- opportunity name
- organization
- type
- deadline
- description
- requirements
- official source
- application link
- verification/trust indicator

The HULUM concept explicitly includes verified official-source opportunities. fileciteturn5file0L28-L35

---

### 6.4 Eligibility Analysis

Input:

```text
User Profile + Opportunity Requirements
```

Output:

```text
Decision
Fit Score
Matched Requirements
Missing Requirements
Uncertain Requirements
Reasoning
Next Action
```

---

### 6.5 APPLY / MAYBE / SKIP

#### APPLY

Use when known key requirements are met.

```text
APPLY
91% fit

You meet the key known requirements.
Next action: prepare your application materials.
```

#### MAYBE

Use when important requirements are uncertain or need verification.

```text
MAYBE
68% fit

You appear eligible, but one requirement needs verification.

Next action: verify the experience requirement.
```

#### SKIP

Use when a critical requirement is clearly not met.

```text
SKIP
42% fit

A critical requirement is not met.

Next action: find opportunities matching your current profile.
```

The supplied concept defines the three decisions in this way. fileciteturn5file0L16-L27

---

# 7. Requirement Status Model

Every requirement:

```text
MET
NOT_MET
UNCERTAIN
NOT_APPLICABLE
```

Example:

```text
Requirement                  Status
-----------------------------------------
African resident             MET
University student           MET
Computer Science             MET
GPA >= 3.5                   MET
English                      MET
2 years experience           NOT_MET
Portfolio                    UNCERTAIN
```

This gives HULUM an auditable reasoning foundation.

---

# 8. Decision Engine

## Flow

```text
Profile
  ↓
Normalize profile
  ↓
Load opportunity
  ↓
Normalize requirements
  ↓
Requirement matching
  ↓
Critical requirement check
  ↓
Base fit calculation
  ↓
Decision
  ↓
Explanation
  ↓
Gap analysis
  ↓
Readiness checklist
```

## Initial rule

```text
IF critical requirement is NOT_MET
    → SKIP

ELSE IF key requirements are MET
     AND no significant uncertainty
    → APPLY

ELSE
    → MAYBE
```

The exact weights must be documented and tested.

---

# 9. AI Responsibility

Use the LLM for:

- natural-language explanation
- summarization
- profile extraction from voice/text
- readiness-plan generation
- conversational Q&A
- language explanation/translation where appropriate

Do **not** make the LLM the sole source of truth for:

- official requirements
- deadlines
- country eligibility
- profile facts
- deterministic requirement matching

Preferred pipeline:

```text
Structured data
      ↓
Rules / matching
      ↓
Decision
      ↓
LLM explanation
```

---

# 10. Fit Score

The fit score is a product signal, **not a guarantee of eligibility or acceptance**.

Candidate inputs:

```text
education
country
field
experience
language
documents
deadline
other requirements
```

The score should be generated from documented logic rather than an unexplained model number.

---

# 11. Readiness Checklist

The checklist turns analysis into action.

Example:

```text
READINESS

☐ Update CV
☐ Prepare portfolio
☐ Write motivation statement
☐ Request recommendation letter
☐ Confirm transcript
☐ Verify deadline
```

Each item can contain:

```text
task
status
reason
source
priority
```

Statuses:

```text
TODO
IN_PROGRESS
DONE
NOT_REQUIRED
```

The source concept explicitly includes a document-by-document readiness action plan. fileciteturn5file0L41-L55

---

# 12. Voice — Voxide

Voice interaction is required by STARK and must be meaningful.

HULUM should use Voxide as an actual product interface.

## Required voice actions

```text
CREATE / UPDATE PROFILE
SHOW OPPORTUNITIES
FILTER OPPORTUNITIES
OPEN OPPORTUNITY
ANALYZE OPPORTUNITY
EXPLAIN DECISION
SHOW GAPS
SHOW READINESS
FILTER BY DECISION
```

Examples:

> "Should I apply for this?"

> "Why did you say apply?"

> "What am I missing?"

> "What should I prepare?"

> "Show me MAYBE opportunities."

The supplied concept specifies Voxide for Amharic, English, and Afaan Oromo. fileciteturn5file2L197-L213

---

# 13. Language Strategy

Priority:

1. English
2. Amharic
3. Afaan Oromo

Do not attempt to translate every screen into every language during the MVP.

Prioritize the core voice flow.

---

# 14. Voice Failure Strategy

Voice failure must not destroy the demo.

Fallback:

```text
Voice
  ↓
Text input / quick actions
```

The application must remain usable without a live voice connection.

---

# 15. Opportunity Verification

Every opportunity should prefer:

```text
official_source_url
application_url
organization
verification_status
last_verified_at
```

Statuses:

```text
VERIFIED
NEEDS_REVIEW
EXPIRED
```

Never invent an opportunity or application link.

---

# 16. ScholarXIV Strategy

ScholarXIV must document the **actual** ideation process.

Research questions from the supplied HULUM concept include:

- What barriers stop Ethiopian students from applying for eligible opportunities?
- How should AI communicate eligibility uncertainty responsibly?
- Does voice-first design improve access for non-English speakers?
- What causes opportunity application failure among African youth?

The supplied concept includes these questions directly. fileciteturn5file2L232-L241

## Ideation trail

```text
Problem
  ↓
Research
  ↓
Existing approaches
  ↓
Observed gap
  ↓
Alternative ideas
  ↓
Rejected ideas
  ↓
Chosen hypothesis
  ↓
Prototype
  ↓
Testing
  ↓
Iteration
  ↓
Final HULUM
```

Do not manufacture history.

---

# 17. Competitor Positioning

The supplied research found that the Ethiopian landscape reviewed was primarily opportunity aggregation/reposting rather than AI eligibility reasoning.

The research also identified global/African AI matching platforms including:

- OpportunityHub
- ScholarConnect Africa
- MyFuture
- Reslocate
- Scholarar
- AI Scholarship Finder / iweaver
- Orbit's Scholarship Matcher
- Scholly
- Fastweb
- Bold.org

The differentiation should therefore **not** be:

> "AI opportunity matching is new."

Instead:

```text
Decision
+
Readiness
+
Voice
+
Amharic / Afaan Oromo
+
Ethiopian target users
```

The supplied research identifies voice/local-language support plus the APPLY/MAYBE/SKIP mechanic as the opportunity gap. fileciteturn5file4L364-L379

Important: external competitor counts should be re-verified before being presented to judges as current facts.

---

# 18. Technical Architecture

```text
                    HULUM
                      │
        ┌─────────────┴─────────────┐
        │                           │
     FRONTEND                    BACKEND
     Next.js                    Node.js
     TypeScript                 Express
     Tailwind                   TypeScript
        │                           │
        │              ┌────────────┴────────────┐
        │              │                         │
        │        Decision Engine              Data
        │              │                         │
        │           Claude API                Supabase
        │                                     PostgreSQL
        │                                     RLS
        │
      Voxide
        │
   Voice Interface
        │
        └──────────────→ Backend API
```

The supplied technical concept proposes Next.js/TypeScript/Tailwind, Node/Express/TypeScript, Supabase/PostgreSQL/RLS, Claude API, Voxide, ScholarXIV Papers API + MCP, and EthioDeploy. fileciteturn5file2L195-L205

---

# 19. Repository Structure

```text
hulum/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   │
│   └── server/
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── decision/
│       │   ├── ai/
│       │   ├── voice/
│       │   └── ...
│       └── ...
│
├── packages/
│   └── shared/
│       ├── types/
│       ├── schemas/
│       └── constants/
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── README.md
│
├── docs/
│   ├── product/
│   ├── research/
│   ├── architecture/
│   ├── decisions/
│   └── demo/
│
├── scripts/
├── .github/
│   └── workflows/
├── README.md
├── .env.example
├── .gitignore
└── package.json
```

---

# 20. Database Model

## users

```text
id
name
email
created_at
updated_at
```

## profiles

```text
id
user_id
education_level
field_of_study
graduation_year
country
city
languages
skills
experience
interests
created_at
updated_at
```

## opportunities

```text
id
title
organization
type
description
deadline
country_eligibility
education_requirements
field_requirements
experience_requirements
language_requirements
document_requirements
other_requirements
application_url
source_url
verification_status
last_verified_at
created_at
updated_at
```

## analyses

```text
id
user_id
opportunity_id
decision
fit_score
summary
created_at
updated_at
```

## requirement_results

```text
id
analysis_id
requirement_key
requirement_text
status
evidence
reason
```

## readiness_items

```text
id
analysis_id
title
description
status
priority
created_at
updated_at
```

## voice_sessions

```text
id
user_id
language
started_at
ended_at
```

Do not store unnecessary voice data.

---

# 21. API v0.1

## Profile

```http
POST /api/profile
GET  /api/profile/:userId
PATCH /api/profile/:userId
```

## Opportunities

```http
GET /api/opportunities
GET /api/opportunities/:id
```

## Analysis

```http
POST /api/opportunities/:id/analyze
GET /api/analyses/:id
```

## Readiness

```http
GET /api/analyses/:id/readiness
PATCH /api/readiness/:id
```

## Voice

```http
POST /api/voice/session
POST /api/voice/action
```

Exact endpoint names may change during implementation, but shared contract changes must be communicated.

---

# 22. Shared Analysis Contract

```json
{
  "decision": "APPLY",
  "fitScore": 91,
  "summary": "You meet the key known requirements.",
  "requirements": [
    {
      "key": "education",
      "status": "MET",
      "evidence": "User is a university student."
    },
    {
      "key": "country",
      "status": "MET",
      "evidence": "Opportunity accepts applicants from Ethiopia."
    },
    {
      "key": "experience",
      "status": "UNCERTAIN",
      "evidence": "Experience requirement needs verification."
    }
  ],
  "gaps": [],
  "nextAction": "Prepare your CV and motivation statement.",
  "readiness": [
    {
      "title": "Prepare CV",
      "status": "TODO"
    }
  ]
}
```

Frontend and backend must agree on the contract before dependent implementation.

---

# 23. Frontend Pages

## `/`

Landing page.

## `/profile`

Profile creation/editing.

## `/opportunities`

Opportunity list and filters.

## `/opportunities/[id]`

Opportunity details and:

```text
Analyze for me
```

## `/analysis/[id]`

The most important screen:

```text
Decision
 ↓
Fit
 ↓
Why
 ↓
Matched
 ↓
Missing
 ↓
Readiness
 ↓
Apply
```

## `/assistant`

Voice/conversational experience.

---

# 24. UI Direction

The interface should be:

- minimalist
- clean
- serious
- readable
- responsive
- mobile-friendly
- accessible

Avoid:

- generic AI gradients
- excessive glassmorphism
- robot imagery
- unnecessary animations
- decorative AI effects
- information overload

The decision should be visually dominant.

---

# 25. Example Analysis UI

```text
Google Africa Fellowship

APPLY

91% FIT

You meet the key known eligibility requirements.

MATCHED
✓ African residency
✓ University student
✓ Computer science background
✓ English

NEEDS ATTENTION
⚠ Motivation statement

NEXT ACTION
Prepare your CV and motivation statement.

[ View Readiness ]
[ Apply Officially ]
[ Ask HULUM ]
```

---

# 26. Contextual Assistant

The assistant should know:

```text
current user
current opportunity
current analysis
current gaps
current readiness tasks
```

Example:

User:

> Why APPLY?

HULUM:

> You meet the education, location, field, and language requirements. The remaining application step is preparing your motivation statement.

---

# 27. Voice Intent Mapping

```text
SHOW_OPPORTUNITIES
FILTER_OPPORTUNITIES
OPEN_OPPORTUNITY
ANALYZE_OPPORTUNITY
EXPLAIN_DECISION
SHOW_GAPS
SHOW_READINESS
FILTER_BY_DECISION
UPDATE_PROFILE
```

Example:

```text
"Show me internships"
        ↓
SHOW_OPPORTUNITIES
        ↓
type = internship
```

---

# 28. Error Handling

Handle:

- AI timeout
- voice failure
- database failure
- invalid profile
- missing opportunity
- expired opportunity
- missing source
- malformed AI output
- API rate limits
- network failure

Never expose raw technical errors.

Example:

```text
We couldn't analyze this opportunity right now.

Try again.
```

---

# 29. AI Output Validation

Pipeline:

```text
Claude response
    ↓
JSON parse
    ↓
Schema validation
    ↓
Business-rule validation
    ↓
Persist
    ↓
Frontend
```

If validation fails:

```text
retry
fallback
or safe error
```

---

# 30. Security

Minimum:

- secrets in environment variables
- `.env` ignored
- Supabase RLS where appropriate
- no API keys in frontend
- input validation
- authorization checks
- rate limiting for expensive AI endpoints where practical
- minimize stored personal/voice data

---

# 31. Authentication

Authentication is useful but must not block the core MVP.

Priority:

```text
P0
Basic user/profile persistence

P1
Full authentication

P2
Advanced account settings
```

If authentication threatens the schedule, simplify it rather than delaying the core product loop.

---

# 32. Opportunity Data Strategy

Start with:

```text
10–20 curated opportunities
```

Each must have:

- official organization
- official source
- deadline
- requirements
- application URL
- verification state

Only later consider:

```text
curated
 ↓
semi-automated ingestion
 ↓
automated discovery
```

---

# 33. Testing Strategy

## Unit

Test:

- requirement matching
- decision rules
- score calculation
- deadline state
- requirement status
- API validation

## Integration

Test:

```text
profile
 ↓
opportunity
 ↓
analysis
 ↓
database
 ↓
frontend
```

## Voice

Test:

- English
- Amharic
- Afaan Oromo where supported
- fallback behavior

## Demo

Repeat the exact demo scenario multiple times.

---

# 34. Definition of Done

A task is complete only when:

1. Implementation is finished.
2. Acceptance criteria pass.
3. Relevant tests/review are completed.
4. Dependencies are documented.
5. Changes are committed and pushed.
6. Documentation is updated.
7. The other teammate can understand/use the result.
8. Known limitations are recorded.
9. STARK evidence/changelog is updated where required.

---

# 35. Team Ownership

## Kidist

Primary:

- frontend
- UI/UX
- profile experience
- opportunity experience
- analysis experience
- readiness experience
- voice UX
- frontend integration
- demo experience

Shared:

- ScholarXIV
- testing
- product decisions
- demo
- documentation

## Mulualem

Primary:

- backend
- database
- API
- requirement engine
- fit calculation
- AI service integration
- opportunity data ingestion
- security
- deployment/backend infrastructure

Shared:

- ScholarXIV
- testing
- product decisions
- demo
- documentation

---

# 36. Git Workflow

Use one shared repository.

`main` must remain demo-able.

Branch naming:

```text
task<N>-<owner>-<short-desc>
```

Examples:

```text
task1-kidist-project-foundation
task1-mulualem-backend-foundation
task4-kidist-profile-ui
task4-mulualem-profile-api
```

Flow:

```text
main
 ↓
pull latest main
 ↓
create short-lived branch
 ↓
implement
 ↓
test
 ↓
commit
 ↓
push
 ↓
review
 ↓
merge
 ↓
delete branch
```

Commit convention:

```text
Task <N>: <what you did>
```

Examples:

```text
Task 4: Build profile creation form
Task 5: Add opportunity schema
Task 7: Implement requirement matcher
Task 10: Add APPLY decision UI
Task 13: Integrate voice action routing
```

Do not manufacture development history.

---

# 37. Shared Contract Rule

Before dependent implementation:

```text
Agree
 ↓
Document
 ↓
Implement
```

Do not silently change:

- API contracts
- database schemas
- shared types
- analysis JSON
- voice intent names

---

# 38. First Vertical Slice

Highest-priority engineering milestone:

```text
Create Profile
     ↓
Open Opportunity
     ↓
Analyze
     ↓
Requirement Matching
     ↓
APPLY / MAYBE / SKIP
     ↓
Explanation
     ↓
Readiness
```

Do not build all features in parallel before this works.

---

# 39. 20-Day Execution Plan

## Day 1 — Foundation

### Kidist

- initialize frontend
- base layout
- design tokens
- initial profile UI

### Mulualem

- initialize backend
- Supabase
- database foundation
- environment setup

### Both

- shared types
- Git workflow
- ScholarXIV ideation start
- README

Deliverable:

```text
Frontend runs
Backend runs
Database connects
```

---

## Day 2 — Product Contracts

Define:

- profile schema
- opportunity schema
- analysis schema
- requirement status
- decision enum
- API contract

---

## Day 3 — Opportunity Seed

### Mulualem

- tables
- seed script
- 10–20 curated opportunities

### Kidist

- opportunity list
- opportunity card
- details UI

---

## Day 4 — Profile

### Kidist

- creation
- editing
- validation
- responsive UI

### Mulualem

- profile API
- persistence

Deliverable:

```text
User can create and save profile.
```

---

## Day 5 — Opportunity Details

Build:

- details page
- requirements
- official source
- application URL
- verification status

---

## Day 6 — Requirement Engine

Implement:

- normalization
- matching
- MET / NOT_MET / UNCERTAIN
- critical requirement detection

---

## Day 7 — APPLY / MAYBE / SKIP

Implement:

- decision logic
- score
- decision API
- tests

Milestone:

```text
Profile + Opportunity
        ↓
APPLY / MAYBE / SKIP
```

---

## Day 8 — Analysis UI

Build:

```text
Decision
Fit
Why
Matched
Missing
Next action
```

---

## Day 9 — Explanation Layer

Connect Claude to structured decision data.

Input:

```text
profile
requirements
decision
requirement results
```

Output:

```text
plain-language explanation
```

---

## Day 10 — Readiness

Build:

```text
Gaps
 ↓
Checklist
 ↓
Next action
```

---

## Day 11 — Voice Foundation

Start Voxide with:

```text
Analyze
Why?
What am I missing?
What should I prepare?
```

English first.

---

## Day 12 — Amharic Voice

Test the core flow in Amharic.

Examples:

```text
"ለዚህ እድል ማመልከት አለብኝ?"
"ለምን?"
"ምን ጎድሎኛል?"
"ምን ላዘጋጅ?"
```

---

## Day 13 — Afaan Oromo

Implement the supported core voice flow where Voxide capability permits and only keep it if stable.

---

## Day 14 — Voice Actions

Add:

```text
show
filter
open
analyze
explain
gaps
readiness
```

Voice must change real product state.

---

## Day 15 — ScholarXIV

Document:

- problem
- research
- alternatives
- rejected ideas
- competitor analysis
- product hypothesis
- AI uncertainty approach
- voice rationale
- iteration

---

## Day 16 — Integration + Testing

Test the entire chain:

```text
Profile
 ↓
Opportunity
 ↓
Analysis
 ↓
Decision
 ↓
Explanation
 ↓
Readiness
 ↓
Voice
```

---

## Day 17 — Deployment

Target:

```text
EthioDeploy
```

Verify:

- environment variables
- database
- API
- frontend
- voice
- AI
- errors

---

## Day 18 — Polish

Focus on:

- responsive UI
- loading
- empty states
- errors
- accessibility
- mobile
- typography
- analysis clarity

No major new features.

---

## Day 19 — Demo Engineering

Create:

- 3-minute demo
- backup flow
- backup screenshots/video
- stable demo profile
- stable demo opportunities
- exact voice commands
- text fallback

---

## Day 20 — Freeze

Only:

```text
Bug fixes
Testing
Documentation
Demo rehearsal
Changelog
README
Final deployment
```

No risky features.

---

# 40. MVP Priority Matrix

## P0

```text
Profile
Opportunity data
Opportunity details
Requirement matching
APPLY / MAYBE / SKIP
Fit score
Explanation
Gap analysis
Readiness checklist
Voxide
Amharic voice
Official source
Working deployment
```

## P1

```text
Afaan Oromo voice
Advanced filters
Opportunity recommendations
Authentication
Saved opportunities
History
```

## P2

```text
Automatic web crawling
Notifications
Email alerts
Application tracking
CV analysis
Calendar integration
Advanced analytics
Native mobile app
```

Do not allow P2 features to delay P0.

---

# 41. Explicitly Out of v0.1

Do not build:

- huge scraping infrastructure
- native mobile application
- complex recommendation ML
- social network
- application submission automation
- full CV builder
- payment system
- complicated admin platform
- unnecessary analytics dashboard
- multiple AI agents

---

# 42. Demo Scenario

Use one consistent persona:

```text
Computer Science student
Ethiopia
University student
Graduating 2027
Python
React
1 internship
English + Amharic
Interested in AI
```

Flow:

```text
Open HULUM
    ↓
Profile
    ↓
Opportunity
    ↓
Analyze
    ↓
APPLY
    ↓
"Why should I apply?"
    ↓
Explanation
    ↓
"What am I missing?"
    ↓
Gap
    ↓
"ምን ላዘጋጅ?"
    ↓
Readiness
    ↓
Official application
```

This demonstrates:

```text
Problem
→ Decision
→ AI
→ Voice
→ Local language
→ Action
```

---

# 43. Three-Minute Pitch

## 0:00–0:30 — Problem

> "Ethiopian students don't only struggle to find opportunities. They struggle to know which opportunities are actually worth applying to."

## 0:30–1:00 — Product

> "HULUM is an AI opportunity decision agent. It compares your profile with an opportunity and gives you one clear answer: APPLY, MAYBE, or SKIP."

## 1:00–2:20 — Demo

```text
Profile
 ↓
Opportunity
 ↓
APPLY
 ↓
Why?
 ↓
Gap
 ↓
Readiness
 ↓
Amharic voice
```

## 2:20–2:45 — Differentiation

> "We are not building another opportunity directory. HULUM is the decision and readiness layer."

## 2:45–3:00 — Hackathon story

Show:

```text
Research
→
Ideation
→
Prototype
→
Iteration
→
Working product
```

---

# 44. STARK Criteria Mapping

## Ideation

Evidence:

- ScholarXIV research
- problem definition
- competitor research
- alternatives
- rejected ideas
- decision rationale
- iteration notes

## Implementation Strategy

Evidence:

- architecture
- shared contracts
- decision engine
- database
- API
- AI validation
- voice intent system
- testing
- deployment

## Teamwork

Evidence:

- GitHub contributions
- branches
- commits
- PRs/reviews
- shared decisions
- changelog
- task ownership
- integration commits

## Creativity

Evidence:

```text
APPLY / MAYBE / SKIP
+
voice-first interaction
+
Amharic/Afaan Oromo
+
decision + readiness
```

## Building Under Pressure

Evidence:

```text
Foundation
→
Decision engine
→
Readiness
→
Voice
→
Deployment
→
Freeze
```

---

# 45. Responsible AI

HULUM's analysis is an aid, not an official eligibility decision.

Recommended notice:

> "HULUM's analysis is based on the information available from the opportunity source and your profile. Always verify final eligibility and deadlines with the official organization."

When information is unclear:

```text
MAYBE
```

rather than false certainty.

---

# 46. Product Trust

Every decision should be traceable to:

```text
Requirement
+
User evidence
+
Status
```

Example:

```text
Requirement:
Bachelor's degree

Profile:
Bachelor's student

Status:
UNCERTAIN

Reason:
The opportunity requires a completed degree,
while the profile indicates the user is still studying.
```

---

# 47. Failure Fallbacks

## AI fails

```text
Structured eligibility results remain available.
Explanation temporarily unavailable.
```

## Voice fails

```text
Text input
Quick action buttons
```

## Opportunity source unavailable

```text
NEEDS_REVIEW
```

## Opportunity expired

Do not recommend applying.

---

# 48. Final Demo Readiness Gate

Before calling HULUM demo-ready:

- [ ] Profile creation works.
- [ ] Opportunity list works.
- [ ] Opportunity details work.
- [ ] Official source is visible.
- [ ] Analysis works.
- [ ] APPLY works.
- [ ] MAYBE works.
- [ ] SKIP works.
- [ ] Fit score uses documented logic.
- [ ] Requirement results are visible.
- [ ] Explanation works.
- [ ] Gap analysis works.
- [ ] Readiness checklist works.
- [ ] English voice works.
- [ ] Amharic voice works.
- [ ] Afaan Oromo voice works if supported and stable.
- [ ] Voice triggers real actions.
- [ ] Voice fallback works.
- [ ] Database persistence works.
- [ ] Production deployment works.
- [ ] Error states work.
- [ ] ScholarXIV evidence is documented.
- [ ] GitHub history reflects actual development.
- [ ] STARK Changelog is updated.
- [ ] README is complete.
- [ ] 3-minute demo is repeatable.
- [ ] Backup demo path exists.

---

# 49. Final Product Definition

HULUM v0.1 is complete when a user can:

```text
1. Create a profile
        ↓
2. Browse a verified opportunity
        ↓
3. Ask HULUM to analyze it
        ↓
4. Receive APPLY / MAYBE / SKIP
        ↓
5. See why
        ↓
6. See what is missing
        ↓
7. Receive a readiness checklist
        ↓
8. Ask questions through voice
        ↓
9. Use English / Amharic
       ↓
10. Open the official opportunity source
```

If this flow works reliably, we have a real HULUM product.

---

# 50. Final Product Principle

> **Do not build the biggest opportunity platform. Build the clearest opportunity decision product.**

The core thesis:

> **HULUM doesn't just find opportunities. It tells you which ones are worth your time — and exactly what to do next.**

Everything in v0.1 should support that thesis.

---

# 51. Version History

## v0.1

Initial locked build specification.

```text
IDEA: LOCKED
MVP: LOCKED
ARCHITECTURE: INITIAL
TEAM OWNERSHIP: DEFINED
20-DAY PLAN: DEFINED
DEMO FLOW: DEFINED
```

Next implementation milestone:

> **Task 1 — Project Foundation**
