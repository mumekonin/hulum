# Phase 1 research questions

**Owner:** Kidist + Mulualem (shared)  
**Source:** `task.md` Phase 1  
**Status:** Questions recorded. Answers that need papers wait for Phase 2 ScholarXIV.  
**Date recorded:** 2026-09-18

Do not treat the working hypotheses below as published findings. Do not add fake paper titles or DOIs.

| Research question | Why it matters for HULUM | Working product hypothesis | Evidence status |
|---|---|---|---|
| What barriers stop Ethiopian students from applying when they may be eligible? | Explains MAYBE vs SKIP vs APPLY copy | Uncertainty and English-only fine print cause both wasted applications and missed ones | Searched 2026-10-07: no direct study in ScholarXIV (arXiv). Adjacent: uneven access to information resources (2404.08682). Still a hypothesis; needs education-journal sources or interviews |
| What causes opportunity application failure among African youth? | Shapes readiness items | Failure is often preparation/deadline/eligibility mismatch, not lack of listings | Searched 2026-10-07: adjacent evidence only — credit barriers (2209.08574), fragmented and uncoordinated programs (2310.07789, 2311.06048). Supports "not only the applicant's fault"; preparation/deadline claim still a hypothesis |
| How should AI communicate eligibility uncertainty? | Forbids false certainty | Use UNCERTAIN + MAYBE; never let Claude override the engine | Product rule, implemented in engine |
| How do opportunity matching / decision-support systems behave? | Avoid “AI matching is unique” claims | Differentiate on decision + readiness + voice + local language | Competitor list in v0.1 spec must be re-verified |
| Does voice-first design improve access for non-English speakers? | Justifies Voxide as a real action layer | Voice must run Analyze / Why / Missing / Prepare, with text fallback | Answered 2026-10-07: speech recognition for African languages is underrepresented and data-poor (2505.11690, 2510.01145), and quality depends heavily on the model (2512.10968). So voice can widen access only with a text path beside it — which HULUM keeps. English voice reaches HULUM actions (recorded-speech pass); owner mic re-test pending |
| How should English / Amharic / Afaan Oromo work together? | Language UX | English first, Amharic text UX as second language, Afaan Oromo only if stable | Answered 2026-10-07: Amharic ASR accuracy is overstated by current benchmarks (2404.13362) and matched the poor result in our mic pass; Afaan Oromo tooling is prototype-scale (2103.02900); users code-switch with English (2311.15077) and multilingual models handle that unevenly (2103.13309). Keeps ADR 004: English first, Amharic text UX, Oromo text quick actions, per-request language detection |
| What readiness support actually helps after a yes/maybe? | Checklist content | Document-by-document next actions beat generic advice | Product choice; not a trial result |
| How should requirement sources be trusted? | Verification UI | Official URL + last verified + disclaimer | Implemented on opportunity records |
| Where must humans stay in the loop? | Responsible AI | User confirms profile facts; official org remains eligibility authority | Product rule |

Phase 2 research space is `docs/research/`. Live search is on `/research` when keyed; paper-backed answers are logged in `docs/research/scholarxiv.md` (12 papers, 2026-10-07). Product rules follow the engine, not unverified academic claims.
