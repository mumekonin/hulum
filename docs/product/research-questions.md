# Phase 1 research questions

**Owner:** Kidist + Mulualem (shared)  
**Source:** `task.md` Phase 1  
**Status:** Questions recorded. Answers that need papers wait for Phase 2 ScholarXIV.  
**Date recorded:** 2026-09-18

Do not treat the working hypotheses below as published findings. Do not add fake paper titles or DOIs.

| Research question | Why it matters for HULUM | Working product hypothesis | Evidence status |
|---|---|---|---|
| What barriers stop Ethiopian students from applying when they may be eligible? | Explains MAYBE vs SKIP vs APPLY copy | Uncertainty and English-only fine print cause both wasted applications and missed ones | Hypothesis from SRS; needs ScholarXIV |
| What causes opportunity application failure among African youth? | Shapes readiness items | Failure is often preparation/deadline/eligibility mismatch, not lack of listings | Hypothesis; needs ScholarXIV |
| How should AI communicate eligibility uncertainty? | Forbids false certainty | Use UNCERTAIN + MAYBE; never let Claude override the engine | Product rule, implemented in engine |
| How do opportunity matching / decision-support systems behave? | Avoid “AI matching is unique” claims | Differentiate on decision + readiness + voice + local language | Competitor list in v0.1 spec must be re-verified |
| Does voice-first design improve access for non-English speakers? | Justifies Voxide as a real action layer | Voice must run Analyze / Why / Missing / Prepare, with text fallback | Text/quick actions proven; live non-English STT not mic-tested in this repo |
| How should English / Amharic / Afaan Oromo work together? | Language UX | English first, Amharic text UX as second language, Afaan Oromo only if stable | English e2e + Amharic Ask HULUM text UX shipped; Oromo UI/voice open (ADR 004); Voxide STT quality unverified |
| What readiness support actually helps after a yes/maybe? | Checklist content | Document-by-document next actions beat generic advice | Product choice; not a trial result |
| How should requirement sources be trusted? | Verification UI | Official URL + last verified + disclaimer | Implemented on opportunity records |
| Where must humans stay in the loop? | Responsible AI | User confirms profile facts; official org remains eligibility authority | Product rule |

Phase 2 research space is `docs/research/`. Live search is on `/research` when keyed; paper-backed answers in `docs/research/scholarxiv.md` are still empty (no copied rows). Product rules follow the engine, not unverified academic claims.
