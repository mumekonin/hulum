# HULUM product flow (Kidist — Phase 4)

**Owner:** Kidist  
**Source:** `task.md` Phase 4  
**Status:** Mapped to the current web app (tip of `main`, 2026-10-02)

This is the user-facing journey HULUM must keep intact. It is a decision product, not a chatbot and not an opportunity directory.

Related: `docs/product/problem.md`, `docs/product/personas.md`, `docs/demo/script.md`.

## Core journey

```text
Welcome → Create account / Sign in
        ↓
Onboarding (first run) / profile facts
        ↓
HULUM shows opportunities (Discover)
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
| Landing/home | `/` | Welcome thesis; Get started / Sign in → `/sign-in` |
| Sign in / Create account | `/sign-in`, `/verify` | JWT email/password (+ optional Google) |
| Onboarding | `/onboarding` | First-run 4 steps; then Discover |
| Profile view/edit | `/profile` | Structured facts + CV/documents |
| Opportunity list | `/opportunities` | Investigator catalog; search/filters; may be empty |
| Opportunity details + analyze | `/opportunities/[id]` | Requirements, official source, inline Analyze / decision |
| APPLY/MAYBE/SKIP result | `/opportunities/[id]` | Decision dominant; old `/analysis/[id]` redirects here |
| My opportunities | `/my-opportunities` | Saved + analyzed APPLY / MAYBE / SKIP groups |
| Readiness | `/readiness` | Checklist progress across analyzed listings |
| Voice interaction | `/assistant` | Text/quick actions; optional Voxide widget when keyed |
| Screenshot backup | `/screenshot` | When catalog empty or for photo evidence |
| Official source/application | links on detail | Never invented; opens the organization URL |
| Loading / empty / error | route + status UI | Retry, sign in, or return to Discover |

## Decision UI rule

APPLY, MAYBE, and SKIP must be readable without color alone and must not look like a generic AI chat bubble.

Voice, when present, must run the same actions as these screens. If voice fails, text/quick actions stay on this path.

## Responsible notice

HULUM's analysis is based on the information available from the opportunity source and your profile. Always verify final eligibility and deadlines with the official organization.
