# HULUM demo script (STARK walkthrough)

**Owner:** Kidist  
**Persona:** Abeba Tesfaye (already in the app)  
**Runtime:** local `npm run dev` — web `:3000`, API `:3001`  
**Voice:** Ask HULUM text + quick actions (ADR 003). Do not claim live Voxide or a microphone.

Target length: about 6 minutes. One story, not a feature tour.

If Analyze fails, stay on the opportunity and use Ask HULUM text. Do not improvise eligibility facts. Full backup paths (3-minute cut, Analyze failure, API-only): `docs/demo/backup.md`. Day 20 rehearsal notes: `docs/demo/rehearsal.md`.

---

## Do not say

- HULUM is the official eligibility authority.
- Claude chooses APPLY / MAYBE / SKIP.
- Voice speech is live.
- ScholarXIV papers are in the running product.
- The app is deployed to production / EthioDeploy.

Do say: the engine decides; Claude only explains if a key is set; always open the official source.

---

## Setup (before the judges)

1. From the repo root: `npm install` then `npm run dev`.
2. Open http://localhost:3000 in a clean browser profile.
3. Confirm http://localhost:3001/api/health returns `{ "data": { "status": "ok" }, "error": null }`.
4. Optional Claude key is not required.

---

## Script

### 0:00 — Problem (landing `/`)

**Show:** headline and APPLY / MAYBE / SKIP cards.

**Say:** Ethiopian students find opportunities. They still waste time on ones they cannot use. HULUM is a decision agent: one answer, then why, gaps, and what to prepare.

**Click:** Create your profile.

### 0:40 — Profile `/profile`

**Click:** Use demo profile (Abeba Tesfaye).

**Say:** Abeba is a Computer Science student in Ethiopia, bachelor in progress, graduating 2027, Python and React, one internship, English and Amharic.

Do not type a custom profile in the timed demo.

### 1:10 — Catalog `/opportunities`

**Say:** These records are curated with official URLs. HULUM is not a marketplace.

**Click:** A2SV — Africa to Silicon Valley.

### 1:40 — Analyze `/opportunities/opp-a2sv`

**Show:** requirements, Official source, Official application.

**Click:** Analyze for me.

**Say:** The same engine runs here and in Ask HULUM. Fit score is a signal only.

### 2:10 — APPLY `/analysis/[id]`

**Show:** APPLY (expected for Abeba + A2SV), Matched, Needs attention, Readiness, disclaimer.

**Click:** Official source. Return to the tab.

**Say:** Confirm eligibility and the deadline with the organization. HULUM is a decision aid.

**Click:** Ask HULUM.

### 3:00 — Text “voice” `/assistant`

**Show:** Voice unavailable. Type and quick actions still work.

**Say:** Speech is not wired. Backup mode is text so the demo cannot die on a missing Voxide key.

Type or click:

1. Should I apply for this? — same APPLY/MAYBE/SKIP as the screen.
2. Why did you say that?
3. What am I missing?
4. What should I prepare?

### 3:40 — Amharic text (optional, ~30s)

**Click:** Language → አማርኛ.

**Say:** Amharic text and quick actions work. Live Amharic speech is not claimed.

**Click:** ምን ጎድሎኛል? or ምን ላዘጋጅ?

**Say:** Same product actions; language selector also drives explain/readiness wording when Groq is set.

### 4:20 — MAYBE (optional, ~45s)

Back to Opportunities. Open Mastercard Foundation Scholars Program at UCT. Analyze.

**Say:** MAYBE because important facts are uncertain (field fit, financial need). That is not a yes.

### 5:10 — SKIP (optional, ~45s)

Open Chevening. Analyze.

**Say:** SKIP because critical requirements are not met for Abeba (completed bachelor’s, two years’ experience). Time is better spent on a closer match.

### 5:50 — Close

**Say:** One profile, three decisions, official source last. Judges can repeat this without a database admin.

---

## Backup if something breaks

Use `docs/demo/backup.md`. Short version:

| Failure | Recovery |
|---|---|
| Time or no speech | 3-minute text path in the backup doc. |
| API down | Show `/api/health`. Restart `npm run dev`. |
| Analyze error | Ask HULUM → Should I apply for this? |
| Voice/session error | Stay on text and quick actions. |
| Wrong decision | Do not override the engine. Open Official source. |
| No profile | Create profile → demo Abeba. |
| Browser UI dead | API Path C in the backup doc, or `npm test`. |

---

## Timing without MAYBE/SKIP

If you only have five minutes, stop after Ask HULUM why / missing / prepare. Mention UCT MAYBE and Chevening SKIP in one sentence.
