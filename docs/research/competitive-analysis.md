# Competitive analysis

**Owners:** Kidist + Mulualem (shared)  
**Source:** `task.md` Phase 3  
**Review date:** 2026-09-18  
**Rule:** Do not tell judges that “AI matching is unique.” Re-verify any name before a slide.

This pass mixed (a) names already locked in HULUM docs and (b) a 2026-09-18 public-web check. Anything not re-opened in that check is marked **unverified**.

---

## Positioning HULUM must keep

```text
Opportunity
+ Eligibility decision (APPLY / MAYBE / SKIP)
+ Explanation (matched / missing / uncertain)
+ Readiness
+ Voice that runs those actions
+ English / Amharic / Afaan Oromo where stable
+ Ethiopian students and young professionals first
```

HULUM is a **decision and readiness layer** on a small curated official-source set. It is not a catalog competitor on listing volume.

---

## Informal discovery (always in the mix)

| Channel | What users get | Gap vs HULUM |
|---|---|---|
| Telegram / Facebook groups | Fast volume, weak verification | No structured profile match, no APPLY/MAYBE/SKIP, no readiness |
| Issuing-organization sites | Official truth | User must already know the program and interpret eligibility alone |

---

## Ethiopian / Ethiopia-facing discovery

| Name | Check on 2026-09-18 | What it appears to be | HULUM difference |
|---|---|---|---|
| EthioScholarship (`scholarship.et`) | **Verified live** | Search/list of scholarships, internships, fellowships for Ethiopian students; compares deadlines; sends users to official applications; email digest | Discovery and listing. No evidence on that homepage of deterministic APPLY/MAYBE/SKIP, requirement statuses, or Amharic voice actions |
| Ethio-Scholarships (Telegram / LinkedIn, Addis Ababa) | **Verified as a sharing channel** | Free posting of scholarships and internships for Ethiopians | Aggregation/reposting, not a decision engine |
| “OpportunityHub” in `HULUM_Documentation.md` | **Not uniquely resolved** | SRS treats it as an Ethiopian aggregator. Public web also shows **OpportunityHub Africa** (Kigali, listing + application tips). These may not be the same product | Do not cite a single OpportunityHub as a fully mapped competitor until the team opens the exact product the SRS meant |
| “FutureFind” in the SRS | **A FutureFind exists** (`future-find.org`) | AI-personalized internships/research/scholarships, application tracking, waitlist. Not Ethiopia-specific in the public copy | Matching/recommendation feed, not an explainable SKIP/MAYBE engine with official-source duty for Ethiopian users |

Telegram remains the default informal feed even when a website exists.

---

## Global / US scholarship search (verified this pass)

| Name | Check | Apparent capability | HULUM difference |
|---|---|---|---|
| Fastweb (`fastweb.com`) | **Verified live** | Large US-oriented scholarship database; profile → recommended listings | Listing/match feed. Not an Ethiopian voice-first decision agent; does not replace official eligibility |
| Bold.org | **Verified live** | Donor-funded scholarships, often apply-on-platform, US-centric | Application marketplace, not APPLY/MAYBE/SKIP against official third-party rules |
| Scholly (`myscholly.com` / Sallie) | **Verified live** | US scholarship search/filters; Easy Apply sweepstakes-style awards | US search/apply helper, not local-language readiness for Ethiopian applicants |

---

## African matching (verified this pass)

| Name | Check | Apparent capability | HULUM difference |
|---|---|---|---|
| Scholar Africa (`scholar.africa`) | **Verified live** | Profile scored against a verified catalog; official apply URLs; they state eligibility yes/no is for the committee | Closest *matching* neighbor found today. Still a ranked list, not HULUM’s three-way decision + UNCERTAIN + readiness + Amharic voice path |
| Scholarships for Africans (`scholarshipsforafricans.com`) | **Verified live** | Editorial lists and filters by country/field; Ethiopia-specific guides | Content/discovery, not in-product requirement matching |

---

## Names in the v0.1 spec that were **not** re-verified this pass

Leave these off slides until someone opens the live product:

- ScholarConnect Africa
- MyFuture
- Reslocate
- Scholarar
- AI Scholarship Finder / iweaver
- Orbit's Scholarship Matcher

The spec listed them as prior research. That is **historical team note**, not a 2026-09-18 confirmation.

---

## AI matching products

Fastweb, FutureFind, and Scholar Africa all describe profile-based matching. That is why HULUM must not claim uniqueness on “AI matching.”

What this pass did **not** find: a live product that (1) targets Ethiopian users first, (2) returns APPLY / MAYBE / SKIP with MET / NOT_MET / UNCERTAIN, (3) generates a readiness checklist, (4) keeps the official source as authority, and (5) runs those actions by voice in Amharic.

Absence in a web search is not proof that nothing exists. It is only “not found in this review.”

---

## Voice-enabled opportunity systems

No Amharic or Afaan Oromo **voice decision** product was verified in this pass. Consumer scholarship sites above are web search/match. HULUM’s voice requirement stays: same actions as the UI, with text fallback if Voxide fails.

---

## Features HULUM explicitly will not copy (out of MVP)

From `task.md` Phase 34 and the v0.1 spec:

- Large-scale scraping / marketplace
- Auto-submit applications or documents
- Guaranteed eligibility or acceptance
- Unrestricted career chatbot
- Native mobile app in v0.1
- Payments, social network, full CV builder, multi-agent theatre

---

## Judge-safe one-liner

> Other tools help you find opportunities. HULUM helps you decide whether one is worth your time, what you are missing, and what to prepare — then sends you to the official source.

Do not say: “Nobody else uses AI for scholarships.”
