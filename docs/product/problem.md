# The problem HULUM solves

**Team lock (Task 39).** Kidist and Mulualem should explain the product from this page.

HULUM (**opportunity** in Amharic) helps Ethiopian students and young professionals **decide** whether a scholarship, fellowship, internship, job, grant, or competition is worth applying to — not only find another posting.

> HULUM helps you decide which opportunities are worth applying to, why, what you are missing, and what to do next.

It is **not** another Telegram-style listing site. Listing already exists. The hard part is acting before the deadline with a clear yes, maybe, or no.

## Who it is for

- Primary: Ethiopian university students and recent graduates
- Also: young professionals looking at grants, fellowships, and similar programs
- Languages we care about: English first, then Amharic, then Afaan Oromo where voice is stable

People already see opportunities on Telegram, Facebook, websites, and org pages. HULUM sits on the **applicant** side. It does not replace the organization.

## What actually hurts

| Pain | What HULUM does |
|---|---|
| Too many posts, too little time | One verdict: APPLY, MAYBE, or SKIP |
| Hours spent on programs you cannot enter | Match the profile to listed requirements |
| Eligible but unsure | Plain-language why, without changing the engine decision |
| “I’m eligible” is not a plan | Missing requirements + readiness checklist + next action |
| Stale or unofficial posts | Official `sourceUrl` wins; HULUM is not the authority |

## Core loop

```text
Profile → Opportunity → Match → APPLY / MAYBE / SKIP
        → Why → Missing / Uncertain → Readiness → Official source
```

Voice (text/quick actions now; Voxide in the browser when wired) is a shortcut to the same loop. Buttons still work if the mic fails.

## What we will not claim

- We are not the official eligibility or deadline authority. Always check the organization.
- We do not submit applications, take payments, or scrape the open web for v0.1.
- We do not invent opportunities, deadlines, or apply links.
- APPLY is HULUM’s reading of the profile vs listed facts. It is not a promise of acceptance.
- We do not say other Ethiopian platforms “do not exist.” They help with discovery. HULUM’s distinction is **decision + readiness**.

## How this shows up in the product

- `decide()` (Postgres path on `npm run dev`; not Groq, not Claude, not Voxide) sets APPLY / MAYBE / SKIP
- Groq may explain a stored analysis; file-store engines remain for unit tests only
- Every analysis reminds the user to verify the official source

Related: [architecture overview](../architecture/overview.md), [ADR 001](../decisions/001-stack-and-providers.md).

---

## Longer product definition (Kidist, 2026-09-18)

This is not ScholarXIV evidence. Paper-backed answers belong in `docs/research/` once papers are actually collected.

### Opportunity-discovery problem

Ethiopian students and young professionals already see many scholarships, fellowships, internships, jobs, grants, and competitions. Discovery is noisy, not absent. HULUM does **not** try to become another feed. v0.1 listings come from the investigator (evidenced pages with official `sourceUrl`); curated `db:seed` is closed.

### Opportunity-decision problem

The harder problem is deciding, for one specific opportunity: am I eligible, is this worth my time, what am I missing, what should I prepare, should I apply or skip. The locked thesis: **the barrier is decision, not discovery.**

### Uncertainty

HULUM must not convert incomplete facts into false certainty. Statuses are MET / NOT_MET / UNCERTAIN / NOT_APPLICABLE. Critical `NOT_MET` → SKIP. Key requirements met and no significant uncertainty → APPLY. Otherwise → MAYBE.

### Readiness

Even after APPLY or MAYBE, “you look eligible” is not a plan. The checklist uses TODO / IN_PROGRESS / DONE / NOT_REQUIRED and a single next action.

### What this file is not

- Not ScholarXIV evidence
- Not a user interview dataset
- Not permission to scrape unofficial Telegram posts
- Not a guarantee of eligibility or acceptance
