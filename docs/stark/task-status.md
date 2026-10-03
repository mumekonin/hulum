# Task status (honesty index)

**Date:** 2026-10-02  
**Files:** `task.md`, `HULUM_task.md`  
**Rule:** mark what the running product and tests already do. Do not mark Voxide STT, a production host, ScholarXiv live papers, branch-protection require-check, or a browser mic pass that was not run. Older sections below are historical — tip of `main` wins.

---

## 2026-10-03 — SRS deliverables + Task 37–38 local verify

- `HULUM_Documentation.md` §1.2.10: v0.1 status column (local host, investigator catalog, English voice path).
- Task 37–38 Verify lines (`task.md`, `team_assignments.md`): local/CI smoke, not “deployed API”.
- Days 15–16 Production configuration `[x]` annotated: config in code, no public host.
- Claude explanation row: Groq explains; engine decides.

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files, password-reset email, RLS non-owner role.

---

## 2026-10-03 — Create account (/verify) OTP honesty

- `/verify`: visible notice that route is JWT register, not email OTP; metadata description matches.
- README + demo script: `/verify` = Create account, not OTP.
- AuthGateway/AuthInduction unchanged (already real `/api/auth/register` + `/login`).

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files, password-reset email, RLS non-owner role.

---

## 2026-10-02 — Recovery UI + ScholarXIV/seed judge copy

- `/forgot-password`: no "Send reset link" / fake send delay; honest recovery copy visible before action.
- README, narrative, research-questions, demo script/backup/rehearsal: `/research` proxy when keyed; empty `scholarxiv.md` table; papers do not decide.
- `task.md` / `HULUM_task.md`: seed/demo opportunity rows annotated (006 closed; investigator catalog).

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files, password-reset email, RLS non-owner role.

---

## 2026-10-02 — Security / RLS / CI / STARK supersession

- Phase 13/15/19/24 checkboxes annotated: Voxide verify = docs only; English e2e = text path; RLS policies exist but API is still table owner; JWT auth (no password-reset email/OTP); CI deploy workflow = N/A (no deploy job); branch-protection require-check still open.
- Historical entries below that still say HMAC-as-auth, UI-only `/sign-in`/`/verify`, or `db:seed` in CI are **superseded** — tip of `main` is JWT + migrate + `smoke:local` + `smoke:browser`.

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files, password-reset email, RLS non-owner role.

---

## 2026-10-02 — Amharic / voice checkbox honesty

- Days 13–14: Amharic **text UX** checked; not live Amharic STT.
- Phase 13 second language = Amharic Ask HULUM text; third language (Oromo) open.
- Gate 4–6 / MVP: Voxide mic + TTS open; voice intent / actions via text + widget tools checked.
- Research questions + `voxide-languages.md` match: text UX shipped, STT unverified.

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files.

---

## 2026-10-02 — Task 49 DONE + task.md honesty (rule.md)

- Task 49 marked DONE on tip of `main` (`#49`).
- Reopened EthioDeploy deploy checkbox; documented decision stays checked.
- Voice demo split: text/quick actions checked; live mic / Voxide STT open.
- Multilingual research row: Amharic text UX only; Oromo UI/voice open.
- Ask HULUM Oromo chrome → English + explain-language hint (ADR 004).

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files.

---

## 2026-10-02 — Product + freeze-doc honesty

- Personas / hulum-flow / problem: JWT + onboarding + Discover; no seed APPLY triangle or local UUID guest.
- Day 19/20 changelog freeze notes dated as historical; ADR 001 file-store superseded for runtime.
- `smoke:browser` + CI label: welcome `/` → sign-in → onboarding.

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files.

---

## 2026-10-02 — STARK cover: main is the product UI

- STARK README / evidence / narrative / git-history: tip of `main` has welcome → sign-in → onboarding (no “clone main = no web”).
- Architecture overview + verification docs: investigator catalog; seed closed; analysis lives on opportunity detail.

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files.

---

## 2026-10-02 — Post product-UI honesty sync

Shipped on tip of `main` (do **not** treat older HMAC / UI-preview / `db:seed` APPLY rows as current):

- JWT Create account / Sign in (`/sign-in`), onboarding, Discover / My opportunities / Readiness product UI.
- Investigator catalog (Afriwork / EthioScholarship sources among others); curated `db:seed` closed.
- Migrations through `013`; CI = migrate + test + `smoke:local` (register + catalog list) + `smoke:browser` (sign-in → onboarding path).
- File-store fixture deadlines bumped so UNCERTAIN→MAYBE failure-path tests stay calendar-honest.

Still open (honest):

| Item | Why |
|---|---|
| Production deploy / EthioDeploy | No public host |
| Live Voxide mic STT/TTS as a verified demo | Needs keyed mic pass; text/quick actions remain reliable |
| Afaan Oromo UI/voice | ADR 004 — no invented Oromo chrome |
| Required status checks on `main` | Admin step (`docs/ops/branch-protection.md`) |
| Backup video / screenshot PNG pack | Not checked in |
| Password-reset email | Not wired |
| API as non-owner DB role (RLS owner-bypass gone) | Still connects as table owner |

---

## 2026-09-25 — STARK evidence + API docs match JWT

- Evidence index, STARK README, architecture API/exposure, product-links, and database README aligned with JWT + investigator (no seed APPLY).
- Forgot-password copy no longer claims passwords are not stored.

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files.

---


## 2026-09-25 — Deployment guide + screenshot smoke

- Deployment guide matches JWT + investigator + migrations through `009`.
- Browser smoke covers `/screenshot` page chrome (no upload/Groq required).

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files.

---

## 2026-09-25 — README + recovery match JWT

- README and forgot-password copy aligned with JWT / investigator / screenshot (no demo profile endpoint).

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files.

---

## 2026-09-25 — Demo docs match JWT + investigator

- Rewrote `docs/demo/script.md`, `backup.md`, `rehearsal.md`, and screenshot shot list for Create account / typed Abeba / investigator catalog / `/screenshot` backup.
- Removed Continue UUID, Use demo profile, and seeded A2SV/UCT/Chevening from the judge walkthrough.

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files.

---

## 2026-09-24 — Demo-triangle smoke + Amharic second language

> **Superseded (2026-10-02):** curated seed APPLY triangle closed (`006`); CI does not seed the catalog. Amharic text UX + Oromo English chrome remain true.

- Historical: `smoke:local` once checked Abeba APPLY/MAYBE/SKIP via seed.
- Amharic marked as second language (text UX); Oromo selector = explain language, English chrome.

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files.

---

## 2026-09-24 — CI smoke + Amharic demo text

> **Superseded (2026-10-02):** CI runs `db:migrate` + tests + `smoke:local` + `smoke:browser` — **no** `db:seed` (migration `006` closed catalog seed).

- Historical note only: earlier CI ran `db:seed` + `smoke:local`.
- Demo script Amharic text step; screenshot shot list (no images yet).

Still open: deploy, live mic/STT, Oromo, CI require-check (admin), backup video/PNG files.

---

## 2026-09-24 — Amharic text UX + smoke:local

> **Superseded note:** Abeba→A2SV seed APPLY path closed; Amharic text UX still shipped. Current `smoke:local` = register + catalog list (no seed triangle).

- Ask HULUM Amharic chrome/quick actions (text only).
- Historical: `npm run smoke:local` once checked Abeba→A2SV APPLY via seed.

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check, backup video.

---

## 2026-09-24 — Demo backup Postgres path

- `POST /api/profile/demo` on Postgres; backup/script ports fixed to `:3001`.
- Branch protection admin guide; Demonstrate voice = Ask HULUM text path.

Still open: deploy, live mic, Amharic/Oromo e2e, CI require-check (admin), browser tests, backup video.

---

## 2026-09-24 — Language wiring + research/product honesty

- Explain / readiness plan use selected language; profile extract via Ask HULUM counted as profile-by-voice (text/widget path).
- Product-rule research questions marked done; ScholarXIV/empirical items stay open.

Still open: deploy, live mic/demonstrate voice, second/third language e2e, CI branch protection, browser tests, backup video.

---

## 2026-09-24 — Voxide widget integration + mixed-language text

- Days 10–12 Voxide integration marked done (widget behind key; text fallback).
- Mixed-language **text** intent tests; Amharic STT / second language e2e still open.
- STARK evidence index updated for Postgres + session auth.

Still open: deploy, live mic/demonstrate voice, Amharic/Oromo UX, CI branch protection, browser tests, backup video.

---

## 2026-09-24 — English tests + configure docs

- Phase 13 English terminology / decision-explanation tests.
- Phase 23 configure database + production secrets documented (still no public host).
- Day 19 research evidence index: `docs/stark/research-evidence.md`.

Still open: deploy, live Voxide/mic, Amharic/Oromo, CI branch protection require-check, browser tests, backup video.

---

## 2026-09-24 — Session auth + RLS (still on this branch line)

> **Superseded (2026-10-02):** JWT register/login (+ optional Google) is wired on tip of `main`. Session is **JWT HS256** in `X-Hulum-Session` (header name kept; not HMAC-as-auth for judges). `/sign-in` and `/verify` call real `/api/auth/*`. `/forgot-password` stays honest “no email”.

- Historical: early HMAC session for owned API routes.
- RLS owner policies in migration 004 (table-owner API still bypasses until a non-owner role) — **still true**.
- **Still not claimed:** live Voxide mic, password-reset email/OTP, or a public deploy.

Still **open on purpose** (need real external evidence or product work):

| Item | Why |
|---|---|
| Third language (Oromo UI/voice) | ADR 004 — Amharic text UX shipped; Oromo chrome English-only |
| Live Voxide mic / voice response / demonstrate voice | Needs publishable key + mic pass |
| Deploy / production secrets / production verify | No public host |
| Microphone test | Not run as verified demo |
| Block merges when checks fail | CI runs on PR; required branch protection not verified from this pass |
| Backup video/screenshots | Not captured |
| ScholarXIV live Papers API citations | Archived paper table empty; `/research` live when keyed |
| RLS non-owner DB role | API still connects as table owner |

---

## 2026-09-24 honesty sync

> **Superseded (2026-10-02):** Phase 19 auth checkboxes **are** closed on `task.md` (JWT). Recovery (`/forgot-password`) stays honest “no email”. Do not read “Local UUID only” or “UI only auth” as current.

Marked done because the repo already ships them:

- Phase 10 **AI may**: natural language intents, profile extract, explain decision, explain gaps, contextual Q&A (English).
- Phase 10 **AI must not**: enforced by Groq prompts + `guard` / validation tests (no invented requirements/deadlines, no decision override, no false certainty, no official eligibility claim, no replacing official source).
- Phase 14 **Database connection**: `npm run dev` defaults to Postgres (`createApp({ store: "postgres" })`).
- Phase 2 **Link research → product**: `docs/research/product-links.md`.
- Phase 3 **Voice-enabled opportunity systems** research note (expanded in competitive analysis).
- Gate 1 **Research documented**; Gate 6 **Documentation is complete** (Phase 26 rows already `[x]`).

Still **open on purpose** (need real external evidence or product work):

| Item | Why |
|---|---|
| Third language (Oromo UI/voice) | ADR 004 — Amharic text UX shipped; Oromo open |
| Live Voxide mic / voice response / demonstrate voice | Needs publishable key + mic pass |
| Deploy / production secrets / production verify | No public host |
| Microphone test | Not run as verified demo |
| JWT authentication + authorization | **DONE on main (JWT)**; password-reset email / OTP still open |
| Per-user RLS as non-owner runtime | Policies in 004+; API still table owner |
| Block merges when checks fail | CI runs on PR; required branch protection not verified from this pass |
| Backup video/screenshots | Not captured |
| ScholarXIV live Papers API citations | Archived paper table empty; `/research` live when keyed |

---

## Earlier Day 20 freeze (2026-09-19)

See git history for the original freeze note. Product features have landed since; this file is the current honesty index.
