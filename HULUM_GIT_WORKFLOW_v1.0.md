# TEAM HULUM — Git Workflow & Collaboration Standard

**Project:** HULUM — AI Opportunity Decision & Readiness Agent  
**Team:** Kidist + Mulualem  
**Hackathon:** STARK Hackathon 2026  
**Version:** 1.0  
**Status:** Active

---

# 1. Purpose

This document defines how Team HULUM uses Git/GitHub during the STARK Hackathon.

Goals:

- Keep `main` stable.
- Make work traceable.
- Prevent overwrites.
- Make development history demonstrate genuine work.
- Keep reviews fast.
- Keep STARK Changelog/project tracking consistent.
- Make rollback possible.
- Preserve evidence of research, implementation, testing, and iteration.

The repository should clearly show the real development journey:

```text
Problem
 ↓
Research
 ↓
Ideation
 ↓
Architecture
 ↓
Implementation
 ↓
Testing
 ↓
Iteration
 ↓
MVP
 ↓
Final HULUM Product
```

Do not manufacture Git history or create commits that do not represent actual work.

---

# 2. Branch Structure

```text
main
│
├── feat/...
├── fix/...
├── refactor/...
├── docs/...
├── test/...
├── chore/...
└── research/...
```

`main` is the stable/demo branch.

Rules:

- Never develop directly on `main`.
- Never force-push `main`.
- Never merge unfinished work.
- Keep `main` deployable when practical.
- Every meaningful change should be traceable to an issue/task.
- One person normally owns a feature branch.

---

# 3. Branch Naming

Use lowercase kebab-case.

## Features

```text
feat/profile
feat/opportunity-list
feat/opportunity-analysis
feat/decision-engine
feat/readiness-checklist
feat/voice-intent
feat/amharic-voice
feat/mobile-profile
```

## Fixes

```text
fix/analysis-validation
fix/voice-timeout
fix/decision-rule
fix/api-error
fix/mobile-navigation
```

## Refactoring

```text
refactor/shared-types
refactor/analysis-service
refactor/api-client
```

## Documentation

```text
docs/architecture
docs/research
docs/scholarxiv
docs/decision-engine
docs/voice-ux
docs/demo
```

## Tests

```text
test/decision-engine
test/requirement-matching
test/voice-intents
test/api-analysis
```

## Chores

```text
chore/setup-nextjs
chore/setup-express
chore/configure-ci
chore/setup-supabase
```

## Research

```text
research/competitor-analysis
research/scholarxiv
research/voice-ux
research/opportunity-verification
```

---

# 4. Branch Ownership

Normally one person owns a feature branch.

### Kidist

Typical ownership:

```text
feat/web-...
feat/mobile-...
feat/voice-ui-...
feat/readiness-ui-...
docs/...
research/...
```

### Mulualem

Typical ownership:

```text
feat/api-...
feat/database-...
feat/decision-engine-...
feat/analysis-service-...
feat/voice-backend-...
fix/...
test/...
```

### Shared

For shared contracts or architecture, agree before editing:

```text
packages/shared/
database/migrations/
API contracts
architecture documents
README.md
task.md
CHANGELOG.md
```

Avoid having both developers independently rewrite the same shared file.

---

# 5. Create a Branch

Always start from current `main`:

```bash
git switch main
git pull origin main
git switch -c feat/your-feature
```

Example:

```bash
git switch main
git pull origin main
git switch -c feat/decision-engine
```

---

# 6. Before Starting Work

Run:

```bash
git status
git branch
git pull origin main
```

Confirm:

- Correct branch.
- Clean starting point.
- Latest `main`.
- No uncommitted unrelated changes.

Then check the assigned task/issue before implementation.

---

# 7. Commit Convention

Use:

```text
type(scope): short description
```

Examples:

```text
feat(profile): add user profile schema
feat(opportunity): add opportunity detail page
feat(analysis): add opportunity analysis endpoint
feat(decision): implement APPLY MAYBE SKIP rules
feat(readiness): generate readiness checklist
feat(voice): map voice input to analysis intent
feat(voice): add Amharic voice interaction
feat(mobile): add opportunity analysis screen

fix(ai): reject malformed explanation output
fix(voice): handle speech timeout
fix(api): validate analysis payload
fix(decision): handle uncertain requirements

refactor(shared): centralize opportunity types

test(decision): add critical requirement cases
test(matching): add uncertain requirement cases
test(voice): add intent mapping tests

docs(architecture): document HULUM AI pipeline
docs(research): record ScholarXIV findings
docs(voice): document Voxide intent flow

chore(ci): add GitHub Actions checks
chore(database): add initial migration
```

Avoid meaningless messages such as:

```text
update
changes
fix
final
final final
everything
done
```

---

# 8. Commit Types

| Type | Meaning |
|---|---|
| `feat` | New functionality |
| `fix` | Bug fix |
| `refactor` | Behavior-preserving restructuring |
| `test` | Tests |
| `docs` | Documentation |
| `chore` | Tooling/configuration |
| `perf` | Performance |
| `build` | Build/dependency changes |
| `research` | Research/evidence work |

---

# 9. Commit Size

Prefer focused commits.

Example:

```text
feat(decision): add requirement status model
feat(decision): add critical requirement rules
test(decision): add APPLY MAYBE SKIP cases
docs(decision): document decision rules
```

Avoid one opaque commit containing the entire HULUM subsystem when smaller logical commits are practical.

A reviewer should be able to understand what changed and why.

---

# 10. Pull Request Workflow

```text
Issue / Task
 ↓
Branch
 ↓
Implementation
 ↓
Local test
 ↓
Commit
 ↓
Push
 ↓
Pull Request
 ↓
Review
 ↓
Fix review comments
 ↓
Merge
 ↓
Delete branch
```

Every meaningful feature should follow this process.

---

# 11. Push

First push:

```bash
git push -u origin feat/your-feature
```

Later:

```bash
git push
```

Example:

```bash
git push -u origin feat/decision-engine
```

---

# 12. Pull Request Requirements

## Title

Follow the commit convention:

```text
feat(decision): implement APPLY MAYBE SKIP engine
```

## Description

Use:

```text
## What
What was implemented?

## Why
Why is it needed for HULUM?

## How
How does it work?

## Testing
What was tested?

## Dependencies
Does another feature depend on this?

## Risks
What should reviewers watch for?

## STARK Evidence
What development/research/demo evidence was produced?
```

Example:

```text
## What
Implemented deterministic requirement matching and APPLY/MAYBE/SKIP decisions.

## Why
This is the core HULUM decision flow.

## How
Profile requirements are compared against structured opportunity requirements.

## Testing
Added cases for MET, NOT_MET and UNCERTAIN requirements.

## Dependencies
Requires the opportunity and profile schemas.

## Risks
Ambiguous requirements should return UNCERTAIN rather than a false match.

## STARK Evidence
Updated decision-engine documentation and changelog.
```

---

# 13. PR Checklist

Before requesting review:

- [ ] Code builds.
- [ ] Tests pass.
- [ ] Lint passes.
- [ ] No secrets committed.
- [ ] No unnecessary files committed.
- [ ] API/schema changes documented.
- [ ] Relevant documentation updated.
- [ ] UI tested where applicable.
- [ ] Error states tested.
- [ ] AI output validation considered.
- [ ] Voice behavior tested where applicable.
- [ ] Official-source handling preserved.
- [ ] PR description completed.
- [ ] Related issue/task referenced.
- [ ] STARK evidence/changelog updated where relevant.

---

# 14. Review Rules

At least one teammate should review meaningful PRs.

Prefer extra care for:

- AI orchestration.
- Requirement matching.
- APPLY/MAYBE/SKIP logic.
- Opportunity verification.
- Database schema changes.
- Authentication.
- Voice intent execution.
- Voxide integration.
- Shared types.
- Production deployment.
- Security/privacy behavior.

Review:

- Correctness.
- Architecture.
- Security.
- Responsible-AI behavior.
- Maintainability.
- Testing.
- Scope.
- Product consistency.

---

# 15. Merge Strategy

Prefer **Squash and merge** for feature PRs when practical.

Keep resulting history readable:

```text
main
│
├── feat: add profile system
├── feat: add opportunity data
├── feat: add decision engine
├── feat: add readiness checklist
├── feat: integrate Voxide
├── feat: add mobile core flow
└── fix: handle AI timeout
```

Merge only when the PR meets its acceptance criteria.

---

# 16. Keeping a Feature Branch Updated

```bash
git fetch origin
git switch main
git pull origin main
git switch feat/your-feature
git merge main
```

Or, for a developer comfortable with rebasing:

```bash
git fetch origin
git rebase origin/main
```

Do not rewrite a shared branch without agreement.

---

# 17. Merge Conflicts

When a conflict occurs:

1. Stop and understand both changes.
2. Do not blindly choose ours/theirs.
3. Resolve logically.
4. Run tests.
5. Review the final diff.
6. Commit the resolution.

Useful commands:

```bash
git status
git diff
```

For HULUM, pay special attention to conflicts in:

```text
packages/shared/
database/migrations/
API contracts
decision-engine rules
README.md
task.md
CHANGELOG.md
```

---

# 18. Never Do This

Never force-push `main`:

```bash
git push --force origin main
```

Do not use destructive reset commands unless you fully understand what will be lost.

Never commit:

```text
.env
API keys
tokens
private credentials
database passwords
service secrets
```

Never fabricate commits, timestamps, research evidence, or development history.

---

# 19. Environment Variables

Use local `.env`; commit only `.env.example`.

Example:

```env
PORT=
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLAUDE_API_KEY=
VOXIDE_API_KEY=
CLIENT_URL=
```

Use the actual provider's exact variable names in the real project.

Never put real credentials in `.env.example`.

---

# 20. `.gitignore`

At minimum:

```gitignore
node_modules/
.env
.env.*
!.env.example

dist/
build/
coverage/

.next/
.expo/

.DS_Store
*.log
```

---

# 21. GitHub Issues

Every significant task should have an issue.

Useful categories:

```text
feature
bug
research
design
documentation
security
testing
deployment
```

Examples:

```text
[Feature] Implement requirement matching
[Feature] Integrate Voxide analysis intent
[Research] Document ScholarXIV findings
[Bug] Handle uncertain opportunity requirement
[Testing] Add APPLY/MAYBE/SKIP cases
[Deployment] Deploy HULUM backend
```

Include:

- Goal.
- Requirements.
- Acceptance criteria.
- Dependencies.
- Owner.

---

# 22. Issue-to-PR Traceability

Whenever practical:

```text
Issue #23
 ↓
Branch feat/decision-engine
 ↓
Commits
 ↓
PR #31
 ↓
Review
 ↓
Merge
```

Use GitHub issue-closing syntax where appropriate:

```text
Closes #23
```

This creates a clear record of what was requested and what was implemented.

---

# 23. STARK Changelog Discipline

Because HULUM is being built for STARK, significant work should be recorded with:

- Date.
- Contributor.
- Feature/change.
- Why it was done.
- Related issue/PR.
- Important decision.
- Research evidence where relevant.
- Demo/evidence where appropriate.

Example:

```text
## 2026-09-XX — Kidist

### Changed
Added the opportunity analysis result UI.

### Why
Users need to see APPLY/MAYBE/SKIP and the reasons behind the result.

### Evidence
PR #XX
Issue #XX
Screenshot: docs/demo/...

### Decision
Decision logic remains deterministic; Claude is used to explain the result.
```

Do not manufacture history. The repository and changelog must represent actual work performed.

---

# 24. Daily Git Routine

## Start

```bash
git switch main
git pull origin main
git switch -c feat/your-feature
```

## During work

```bash
git status
git diff
```

## Commit logically

```bash
git add .
git commit -m "feat(scope): description"
```

## Push

```bash
git push -u origin feat/your-feature
```

---

# 25. End-of-Day Routine

Before finishing:

- [ ] Push work to remote.
- [ ] Make unfinished work identifiable.
- [ ] Use clear commits.
- [ ] Update issue/task status.
- [ ] Record blockers.
- [ ] Update relevant documentation.
- [ ] Tell teammate about integration dependencies.
- [ ] Record important STARK evidence.

Never leave important work only on one computer.

---

# 26. Hotfix Workflow

```text
main
 ↓
fix/critical-problem
 ↓
test
 ↓
PR
 ↓
review
 ↓
merge
 ↓
deploy
```

Example:

```text
fix/decision-crash
fix/voice-timeout
fix/production-api-error
```

Hotfixes should still be documented and traceable.

---

# 27. Demo/Release Tags

When a genuine milestone is stable:

```bash
git tag v0.1.0
git push origin v0.1.0
```

Suggested HULUM milestones:

```text
v0.1.0 — Project Foundation
v0.2.0 — Opportunity + Profile Vertical Slice
v0.3.0 — Decision Engine
v0.4.0 — Readiness Layer
v0.5.0 — Voice Integration
v0.6.0 — Mobile Core
v0.7.0 — Integrated MVP
v0.8.0 — Demo Ready
v1.0.0 — Final Hackathon Release
```

Only tag genuine milestones.

---

# 28. Recommended GitHub Labels

```text
priority:p0
priority:p1
priority:p2
priority:p3

area:web
area:mobile
area:backend
area:database
area:ai
area:voice
area:decision-engine
area:readiness
area:ux
area:research
area:scholarxiv
area:deployment
area:security
area:testing

status:blocked
status:needs-review
status:ready
```

Ownership labels:

```text
owner:kidist
owner:mulualem
owner:shared
```

---

# 29. Shared Files

Changes to these deserve extra care:

```text
task.md
team_assignments.md
git-workflow.md
README.md
CHANGELOG.md
.env.example
packages/shared/
database/migrations/
API contracts
architecture documents
decision-engine specification
voice intent contracts
```

Communicate before two people edit the same architecture/schema/contract file.

---

# 30. Shared Type Strategy

Where practical, keep canonical shared structures in:

```text
packages/shared/
├── types/
├── enums/
├── schemas/
├── validation/
└── constants/
```

Examples:

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
```

Do not independently duplicate the same definitions across web, mobile, and backend.

---

# 31. API Contract Rule

Before frontend/backend integration, agree on:

```text
Endpoint
HTTP method
Request body
Response body
Errors
Authentication
Status codes
Validation
```

Example:

```text
POST /api/opportunities/:id/analyze
```

Input:

```text
profileId
opportunityId
```

Output should have a stable structure containing:

```text
decision
fitScore
matchedRequirements
missingRequirements
uncertainRequirements
reasons
readinessItems
```

Document exact contracts in project documentation.

---

# 32. Analysis Contract Rule

HULUM analysis should follow a stable contract:

```text
Profile
   +
Opportunity
   ↓
Requirement Matching
   ↓
Requirement Statuses
   ↓
Decision Engine
   ↓
Analysis Contract
   ├── APPLY/MAYBE/SKIP
   ├── fit score
   ├── matched
   ├── missing
   ├── uncertain
   └── next action
          ↓
      Claude explanation
          ↓
       User / Voice
```

The AI explanation must not silently change the deterministic decision.

---

# 33. Voice Intent Rule

Use consistent intent names:

```text
ANALYZE_OPPORTUNITY
EXPLAIN_DECISION
SHOW_MISSING_REQUIREMENTS
SHOW_READINESS
FILTER_OPPORTUNITIES
OPEN_OPPORTUNITY
UPDATE_PROFILE
```

Flow:

```text
Voice
 ↓
Intent detection
 ↓
Validated intent
 ↓
HULUM action
 ↓
Structured result
 ↓
Voice/text response
```

Voice must trigger real HULUM functionality. It should not be a decorative chatbot layer.

---

# 34. Responsible-AI Merge Rule

The following require review:

- Eligibility logic.
- Requirement matching.
- AI explanation generation.
- AI output validation.
- Uncertainty handling.
- Opportunity-source verification.
- User-profile extraction.
- Voice-to-action mapping.

Require:

1. Code review.
2. Tests.
3. Clear acceptance criteria.
4. Documented source/assumptions.
5. Transparent uncertainty where information is incomplete.

HULUM should not claim guaranteed eligibility.

---

# 35. Definition of Done for Code

```text
Implementation
     +
Tests
     +
Review
     +
Documentation
     +
Integration
     +
Traceability
     +
STARK Evidence
     =
DONE
```

A task is not complete merely because the code runs locally.

---

# 36. Recommended Repository Protection

Configure GitHub so that:

- `main` is protected.
- PRs are required.
- CI checks pass before merge where practical.
- Force pushes to `main` are disabled.
- Important branches are not casually deleted.
- Available secret/security scanning is enabled.
- Required review is enabled for critical changes.

---

# 37. Communication Rule

Git is not a substitute for communication.

Tell your teammate before:

- Changing an API.
- Changing database schema.
- Changing shared types.
- Changing the decision-engine contract.
- Changing voice intent structure.
- Replacing a major dependency.
- Rewriting a major component.
- Changing architecture.
- Changing the core APPLY/MAYBE/SKIP rules.

For a 2-person team, communicate early rather than resolving conflicts after both people have implemented incompatible changes.

---

# 38. HULUM 20-Day Git Milestones

Because the team has a limited build window, use Git milestones to make progress visible.

## Days 1–2 — Foundation

```text
v0.1.0
```

Expected evidence:

- Repository created.
- Architecture documented.
- Web/backend/mobile foundations.
- Shared types started.
- Research/ideation documentation started.

## Days 3–5 — Data + Profile

```text
v0.2.0
```

Expected evidence:

- Profile model.
- Opportunity model.
- Seed opportunities.
- API foundations.
- Basic profile/opportunity UI.

## Days 6–8 — Decision Engine

```text
v0.3.0
```

Expected evidence:

- Requirement statuses.
- Matching.
- APPLY/MAYBE/SKIP.
- Tests.
- Explanation contract.

## Days 9–11 — Readiness

```text
v0.4.0
```

Expected evidence:

- Missing requirements.
- Readiness checklist.
- Next actions.
- UI integration.

## Days 12–14 — Voice

```text
v0.5.0
```

Expected evidence:

- Voxide integration.
- Voice intent.
- Real HULUM action.
- Voice response.
- Failure fallback.

## Days 15–16 — Mobile

```text
v0.6.0
```

Expected evidence:

- Mobile core flow.
- API integration.
- Voice integration where stable.

## Days 17–18 — Integration

```text
v0.7.0
```

Expected evidence:

- Web + backend + database.
- Mobile + backend.
- Claude.
- Voxide.
- Tests.
- Deployment.

## Day 19 — Demo Ready

```text
v0.8.0
```

Expected evidence:

- Stable demo.
- Verified opportunity data.
- Voice scenario.
- Backup demo.
- Documentation complete.

## Day 20 — Final

```text
v1.0.0
```

Expected evidence:

- Final product.
- Final changelog.
- Final documentation.
- Clean repository.
- Final demo build.

---

# 39. Final Git Principle

> **Make the repository tell the truth about how HULUM was built.**

The final GitHub history should make it possible to follow:

```text
Problem
 ↓
Research
 ↓
Ideation
 ↓
Architecture
 ↓
Profile + Opportunity
 ↓
Decision Engine
 ↓
Readiness
 ↓
Voice
 ↓
Mobile
 ↓
Testing
 ↓
Iteration
 ↓
MVP
 ↓
Final HULUM Product
```

# 40. Final One-Line Rule

> **Create one task, branch from current main, build one logical change, test it, document it, commit it clearly, open a PR, review it, merge it, and keep the HULUM demo path working.**
