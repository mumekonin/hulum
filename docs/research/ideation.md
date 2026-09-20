# HULUM ideation trail

**Owners:** Kidist + Mulualem  
**Sources:** `HULUM_Documentation.md`, `HULUM_v0.1_COMPLETE_BUILD_SPEC.md`, `task.md`, `docs/product/problem.md`  
**Date recorded:** 2026-09-18  
**Evidence type:** actual product/engineering decisions in this repository. Not a literature review.

```text
Problem
  ↓
Existing approaches (discovery feeds)
  ↓
Observed gap (decision + readiness)
  ↓
Alternative ideas
  ↓
Rejected approaches + reasons
  ↓
HULUM concept (APPLY / MAYBE / SKIP)
  ↓
Prototype (v0.1 vertical slice in this repo)
  ↓
User/product learning (still open)
  ↓
Iteration
  ↓
Final MVP
```

---

## 1. Original problem

Ethiopian students and young professionals already encounter opportunities (Telegram, Facebook, websites, organizations). The painful step is deciding whether an opportunity is worth applying to, why, what is missing, and what to prepare.

Full write-up: `docs/product/problem.md`.

---

## 2. How the idea developed

1. **Observation:** local and regional platforms help people *find* postings.
2. **Gap:** they stop at the listing. The user still reads English fine print, guesses eligibility, and either over-applies or never applies.
3. **Hypothesis:** a structured profile compared to structured requirements can produce a single, explainable action: APPLY, MAYBE, or SKIP, plus a readiness list and the official source.
4. **Constraint:** an LLM must not be the eligibility authority. Matching and decision rules stay deterministic. Voice must trigger those same actions, not a decorative chatbot.
5. **Prototype now in the repo:** profile → curated opportunity → engine → analysis UI → readiness → official URL. Voice is text/quick-action until Voxide is wired.

---

## 3. Alternative ideas considered

These alternatives are recorded because the locked specs explicitly refuse them as HULUM’s identity. They were on the table as “what this product could have been.”

| Alternative | What it would optimize | Why it looked attractive |
|---|---|---|
| Opportunity directory / aggregator | More listings | Matches current Ethiopian channel behavior |
| Telegram/web scraper | Coverage | Would appear to solve “I missed a post” |
| Generic AI chatbot | Conversational UX | Easy to demo as “AI” |
| Auto-apply / form filler | Time-to-submit | Sounds like the last mile |
| Recommendation ML / ranking feed | Personalization | Familiar consumer pattern |
| Native mobile app first | Distribution | Users are mobile-first |
| Multi-agent AI (separate agents for search, decide, write) | Architecture novelty | Common hackathon pattern |

---

## 4. Rejected approaches and reasons

| Rejected idea | Reason for rejection | Where this is locked |
|---|---|---|
| HULUM as another listing site | Does not solve decision or readiness | v0.1 spec §3, §0 |
| Unverified scraping as the data strategy | Invents or stale-posts; trust failure | v0.1 spec §15, §41; out of v0.1 |
| Generic chatbot | Voice/text would not run product actions | v0.1 spec §3, §12; `task.md` Phase 12 |
| Official eligibility authority | HULUM cannot certify admission | Disclaimer on analysis UI |
| Guaranteed acceptance / fit-score-as-verdict | Fit score is a signal; rules decide | Decision engine tests |
| Native mobile in v0.1 | Would delay the web decision loop | README / spec P2 and out-of-MVP |
| Application submission, payments, CV builder, social layer | Scope; not the thesis | `task.md` Phase 34; spec §41 |
| Claude as sole matcher | Cannot be audited; may invent requirements | Engine is source of truth |
| Shipping Afaan Oromo before it is stable | Language count over reliability | v0.1 language strategy |

---

## 5. Why HULUM was selected

HULUM is the combination that matches the stated user pain and the STARK story we can actually build:

```text
Structured profile
  + structured official-source opportunities
  + deterministic APPLY / MAYBE / SKIP
  + explanation of matched / missing / uncertain
  + readiness next action
  + voice that executes the same loop
  + English, then Amharic, then Afaan Oromo if stable
  + Ethiopian students and young professionals as the first users
```

A judge should be able to follow this file → `docs/product/hulum-flow.md` → a live Analyze on `/opportunities`.

---

## 6. Prototype and what we have learned so far

**Implemented:** vertical slice with demo persona Abeba Tesfaye. Example outcomes used in development: A2SV APPLY, Mastercard Foundation at UCT MAYBE, Chevening SKIP.

**Still open (not claimed as user-study results):**

- Whether voice in Amharic increases completed analyses.
- Whether MAYBE copy reduces false-certainty harm.
- Whether the curated 12-opportunity set is enough for a live demo only (yes for demo; not a market catalog).

Further iteration belongs in CHANGELOG as it happens.
