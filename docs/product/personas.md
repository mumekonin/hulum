# HULUM personas and product gap

**Owner:** Kidist  
**Source:** `task.md` Phase 1 P1  
**Date recorded:** 2026-09-18

Personas below are product-design tools from `HULUM_Documentation.md` and the v0.1 demo scenario. They are not statistically sampled user research.

---

## Primary — Student applicant

Ethiopian university student or recent graduate. May prefer Amharic or English. Looking at scholarships, internships, and fellowships. Time-constrained. Needs a clear APPLY / MAYBE / SKIP, not another list.

**v0.1 demo persona already in the app:** Abeba Tesfaye — Computer Science, Ethiopia, bachelor in progress, graduating 2027, Python/React, one internship, English + Amharic, interested in AI.

Use Abeba for the repeatable STARK walkthrough: profile → A2SV (APPLY) / UCT Mastercard (MAYBE) / Chevening (SKIP).

---

## Secondary — Young professional

Early-career professional seeking grants, fellowships, or international roles. Same HULUM loop; different opportunity mix (experience minima will more often drive SKIP or MAYBE).

---

## Guest / unregistered user

May browse opportunities. Analysis still needs a saved profile. v0.1 uses a local user id rather than full auth so the decision loop is not blocked.

---

## System administrator (not a v0.1 user-facing screen)

Curates and verifies opportunity records. In v0.1 this is seed data + `verificationStatus` / `lastVerifiedAt`, not an admin console. Teammate checklist and stale rules: `docs/product/opportunity-verification.md`.

---

## Exact product gap

| User need | What discovery apps usually give | What HULUM must give |
|---|---|---|
| Should I apply? | A posting | APPLY / MAYBE / SKIP |
| Why? | Fine print in English | Requirement statuses with evidence |
| What am I missing? | Nothing structured | NOT_MET and UNCERTAIN items |
| What do I do next? | “Apply here” | Readiness checklist + next action |
| Can I trust this? | Reposted link | Official source, verification state, disclaimer |

Out of v0.1: native mobile app, application submission, payments, scraping unverified sources.
