# HULUM product flow (Kidist — Phase 4)

**Owner:** Kidist  
**Source:** `task.md` Phase 4  
**Status:** Mapped to the current web app

This is the user-facing journey HULUM must keep intact. It is a decision product, not a chatbot and not an opportunity directory.

Related: `docs/product/problem.md`, `docs/product/personas.md`.

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

## Screens and routes

| Screen (`task.md`) | Route | Notes |
|---|---|---|
| Landing/home | `/` | States the product thesis and the journey |
| Profile creation/edit | `/profile` | Structured facts only; demo persona available |
| Opportunity list | `/opportunities` | Curated records with verification, search, type filter, and deadline |
| Opportunity details | `/opportunities/[id]` | Requirements, official source, Analyze |
| Analyze opportunity | POST via details page | Calls the backend decision engine |
| APPLY/MAYBE/SKIP result | `/analysis/[id]` | Decision is visually dominant |
| Explanation view | `/analysis/[id]` | Why the engine decided |
| Requirement status view | `/analysis/[id]` | MET / NOT_MET / UNCERTAIN |
| Readiness checklist | `/analysis/[id]` | TODO / IN_PROGRESS / DONE / NOT_REQUIRED |
| Voice interaction | `/assistant` | Text and quick actions until Voxide is wired |
| Official source/application | links on detail + analysis | Never invented; opens the organization URL |
| Loading / empty / error | `StatusPanel` on core screens | Retry, clear filter, open profile, or return to the list |

## Decision UI rule

APPLY, MAYBE, and SKIP must be readable without color alone and must not look like a generic AI chat bubble.

Voice, when present, must run the same actions as these screens. If voice fails, text/quick actions stay on this path.

## Responsible notice

HULUM's analysis is based on the information available from the opportunity source and your profile. Always verify final eligibility and deadlines with the official organization.
