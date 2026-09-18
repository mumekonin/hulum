# HULUM problem definition

**Owner:** Kidist (product documentation), shared with Mulualem  
**Source:** `task.md` Phase 1  
**Evidence type:** product definition from locked HULUM docs, not a ScholarXIV literature review  
**Date recorded:** 2026-09-18

This file records the problem HULUM is built to solve. It does **not** invent academic citations. Paper-backed answers belong in Phase 2 (`docs/research/`) once ScholarXIV evidence is actually collected.

Primary sources already in this repository:

- `HULUM_Documentation.md` — statement of the problem and user classes
- `HULUM_v0.1_COMPLETE_BUILD_SPEC.md` — locked v0.1 problem and positioning
- `task.md` — Phase 1 checklist
- `docs/product/hulum-flow.md` — the user journey that follows from this problem

---

## 1. Opportunity-discovery problem

Ethiopian students and young professionals already see many scholarships, fellowships, internships, jobs, grants, and competitions. They arrive through Telegram, Facebook, websites, and organizations.

Discovery is noisy, not absent:

- Volume is high and deadlines move fast.
- Postings are fragmented across channels.
- Some listings are stale, unofficial, or unverifiable.

HULUM does **not** try to become another feed that lists more opportunities. Seed data in v0.1 is a small curated set with official source URLs.

---

## 2. Opportunity-decision problem

The harder problem is deciding, for one specific opportunity:

- Am I actually eligible?
- Is this worth my time?
- What am I missing?
- What should I prepare first?
- Should I apply or skip?

The locked product thesis: **the barrier is decision, not discovery.**

HULUM’s answer is one structured verdict — APPLY, MAYBE, or SKIP — produced by matching a structured profile to structured requirements. The deterministic engine is the source of truth. Claude may explain; it may not invent eligibility.

---

## 3. Why people waste time on poor-fit applications

Observed product problem (team definition, not a measured field study):

- Eligibility language is long, English-heavy, and easy to misread.
- Users invest hours in CVs, essays, and recommendations before they know a critical requirement is unmet.
- Confidence is low in both directions: people apply when they should skip, and skip when they might apply.

HULUM’s SKIP path exists to return that time. HULUM’s APPLY path exists to make a good-fit case concrete. Neither path is an official admission decision.

---

## 4. Uncertainty around eligibility requirements

Requirements are often incomplete in the user’s profile, ambiguous in the posting, or only fully stated on the official page.

HULUM must not convert that uncertainty into false certainty.

Requirement statuses:

```text
MET
NOT_MET
UNCERTAIN
NOT_APPLICABLE
```

Product rule already implemented in the engine:

- Critical `NOT_MET` → SKIP
- Key requirements met and no significant uncertainty → APPLY
- Otherwise → MAYBE

MAYBE is the honest product for incomplete information. Users must still open the official source.

---

## 5. Readiness gaps after someone finds an opportunity

Even after a user believes they should apply, “you look eligible” is not an action plan.

Typical missing next steps:

- CV / resume
- Motivation statement
- Transcript
- Recommendation letter
- Deadline confirmation on the official site

HULUM’s readiness checklist turns the analysis into TODO / IN_PROGRESS / DONE / NOT_REQUIRED items and a single next action.

---

## 6. Ethiopian user context

HULUM is for Ethiopian students and young professionals first.

Relevant context recorded in the SRS and v0.1 spec:

- Mobile-first use; opportunities often arrive via Telegram and Facebook.
- English is frequently the language of international postings; Amharic and Afaan Oromo are first-class product languages for voice/UX, not decoration.
- Trust is damaged by unofficial or expired posts. Official source links and verification status are required.
- HULUM sits on the applicant side. It does not submit applications and does not speak for the issuing organization.

---

## 7. Product gap HULUM addresses

Existing discovery platforms (named in `HULUM_Documentation.md` as OpportunityHub, Ethio Scholarship, FutureFind) aggregate postings. That is not HULUM’s gap.

The gap HULUM is built for:

```text
Structured profile
  + structured requirements
  + deterministic APPLY / MAYBE / SKIP
  + explanation
  + readiness
  + official source
  + voice that runs those same actions
  + English / Amharic / Afaan Oromo where quality holds
```

Do not claim “AI matching is new.” Competitor names in the build spec must be re-verified before any judge-facing claim.

---

## What this file is not

- Not ScholarXIV evidence.
- Not a user interview dataset.
- Not permission to scrape unofficial Telegram posts.
- Not a guarantee of eligibility or acceptance.
