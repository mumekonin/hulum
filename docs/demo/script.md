# HULUM demo script (STARK walkthrough)

**Owner:** Kidist  
**Persona:** Abeba Tesfaye (typed facts — there is no “Use demo profile” button)  
**Runtime:** local `npm run dev` — web `:3000`, API `:3001`  
**Auth:** Create account / Sign in (JWT). Google optional if keys are set.  
**Routes:** Create account uses `/verify` (JWT register only—not email OTP).  
**Catalog:** investigator-filled (not `db:seed`). Cards may be empty until the worker has run.  
**Voice:** Ask HULUM text + quick actions (ADR 003). Do not claim live Voxide or a microphone.

Target length: about 6 minutes. One story, not a feature tour.

If Analyze fails or the catalog is empty, use `/screenshot` or Ask HULUM text. Do not improvise eligibility facts. Full backup paths: `docs/demo/backup.md`. Rehearsal notes: `docs/demo/rehearsal.md`.

---

## Do not say

- HULUM is the official eligibility authority.
- Claude chooses APPLY / MAYBE / SKIP.
- Voice speech is live.
- ScholarXIV papers drive APPLY / MAYBE / SKIP (or that we archived paper citations in the repo).
- The app is deployed to production / EthioDeploy.
- There is a one-click Abeba demo profile or a seeded A2SV / Chevening catalog.

Do say: the engine decides; Groq may rephrase a stored analysis when `GROQ_API_KEY` is set (APPLY/MAYBE/SKIP unchanged); always open the official source; the list comes from evidenced pages the investigator fetched. `/research` is live ScholarXIV search with a server key; the STARK paper log stays empty until someone copies a real result.

---

## Setup (before the judges)

1. From the repo root: `npm install` then `npm run db:migrate` then `npm run dev`.
2. Optional: set `GROQ_API_KEY` so explain / screenshot extract / investigator extract can run.
3. Open http://localhost:3000 in a clean browser profile.
4. Confirm http://localhost:3001/api/health returns `{ "data": { "status": "ok" }, "error": null }`.
5. Pre-create an account and save Abeba’s profile once so the timed demo only signs in.

### Abeba facts to type (or pre-save)

| Field | Value |
|---|---|
| Name | Abeba Tesfaye |
| Education | Bachelor in progress |
| Field | Computer Science |
| Graduation year | 2027 |
| Country / city | Ethiopia / Addis Ababa |
| Languages | English, Amharic |
| Skills | Python, React |
| Experience | One software internship. |
| Interests | AI, scholarships, internships |

---

## Script

### 0:00 — Welcome (`/`) and sign in (`/sign-in`)

**Show:** HULUM welcome page, then Get started → sign-in (email/password or Google).

**Say:** Ethiopian students find opportunities. They still waste time on ones they cannot use. HULUM is a decision agent: one answer, then why, gaps, and what to prepare.

**Click:** Sign in (pre-created account) or Create account → fill name / email / password → Create account. Say the `/verify` URL is legacy naming if judges notice it.

### 0:40 — Profile `/profile` (first run: `/onboarding`)

**Show:** Saved Abeba facts and the completion bar. On a first run, Create account opens the 4-step onboarding: about you, education, skills and experience, CV (Skip for now is fine).

**Say:** Abeba is a Computer Science student in Ethiopia, bachelor in progress, graduating 2027, Python and React, one internship, English and Amharic. Anything she leaves out is treated as uncertain, never guessed.

**Optional:** upload a CV in the CV section. It stays private to her account.

### 1:10 — Catalog `/opportunities`

**Say:** These records come from the investigator following official or aggregator pages. HULUM is not a marketplace. If the list is empty, say the worker has not filled it yet and go to Screenshot (next section).

**Click:** One fellowship or scholarship that fits a CS student in Ethiopia (title varies). Prefer a card with an Official source link.

### 1:40 — Analyze `/opportunities/[id]`

**Show:** requirements, Official source, Official application when present.

**Click:** Analyze my fit.

**Say:** The same engine runs here and in Ask HULUM. Fit score is a signal only. Do not invent APPLY / MAYBE / SKIP before the result appears.

### 2:10 — Decision (same page)

**Show:** APPLY, MAYBE, or SKIP as returned, Why / What to check / Not met, Next step, Readiness "X / Y ready", disclaimer. Old `/analysis/[id]` links redirect here.

**Click:** Apply on official website (or View official opportunity). Return to the tab.

**Say:** Confirm eligibility and the deadline with the organization. HULUM is a decision aid.

**Click:** Ask HULUM about this (on-page) so the conversation keeps this opportunity as context.

### 3:00 — Text “voice” `/assistant`

**Show:** Voice unavailable / text path. Type and quick actions still work.

**Say:** Speech is not wired. Backup mode is text so the demo cannot die on a missing Voxide key.

Type or click:

1. Should I apply for this? — same decision as the screen when an opportunity is in session.
2. Why did you say that?
3. What am I missing?
4. What should I prepare?

### 3:40 — Amharic text (optional, ~30s)

**Click:** Reply in → አማርኛ.

**Say:** Amharic text and quick actions work. Live Amharic speech is not claimed.

**Click:** ምን ጎድሎኛል? or ምን ላዘጋጅ?

**Afaan Oromo:** selecting it sets explain language only. Ask HULUM chrome stays English — do not demo invented Oromo UI copy.

### 4:20 — Screenshot path (if catalog empty or Analyze fails)

**Click:** Screenshot in the Primary nav (`/screenshot`).

**Say:** Judges often see posts in Telegram or LinkedIn. Upload a real opportunity screenshot. Groq extracts only what is visible; `decide()` still runs on the server. Missing deadline or URL stays unknown.

**Show:** APPLY / MAYBE / SKIP from the photo + profile. Not saved into the catalog.

### 5:10 — Close

**Say:** One signed-in profile, engine decisions, official source or screenshot evidence last. Judges can repeat this without a database admin.

---

## Backup if something breaks

Use `docs/demo/backup.md`. Short version:

| Failure | Recovery |
|---|---|
| Time or no speech | 3-minute text path in the backup doc. |
| API down | Show `/api/health`. Restart `npm run dev`. |
| Empty catalog | `/screenshot` with a real post photo, or Ask HULUM text. |
| Analyze error | Ask HULUM → Should I apply for this? or Screenshot. |
| Voice/session error | Stay on text and quick actions. |
| Wrong decision | Do not override the engine. Open Official source. |
| No account | Create account → save Abeba facts. |
| Browser UI dead | API Path C in the backup doc, or `npm test` / `npm run smoke:local`. |

---

## Timing without screenshot / second cards

If you only have five minutes, stop after Ask HULUM why / missing / prepare. Mention that MAYBE and SKIP appear when requirements are uncertain or critically unmet — do not invent specific seed titles if they are not in the list.
