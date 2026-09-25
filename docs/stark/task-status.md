# Task status (post Day 20 sync)

**Date:** 2026-09-25  
**Files:** `task.md`, `HULUM_task.md`  
**Rule:** mark what the running product and tests already do. Do not mark Voxide STT, a production host, ScholarXiv live papers, or a browser pass that was not run.

---

## 2026-09-25 — Demo docs match JWT + investigator

- Rewrote `docs/demo/script.md`, `backup.md`, `rehearsal.md`, and screenshot shot list for Create account / typed Abeba / investigator catalog / `/screenshot` backup.
- Removed Continue UUID, Use demo profile, and seeded A2SV/UCT/Chevening from the judge walkthrough.

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), backup video/PNG files.

---

## 2026-09-24 — Demo-triangle smoke + Amharic second language

- `smoke:local` / CI: APPLY + MAYBE + SKIP for Abeba.
- Amharic marked as second language (text UX); Oromo selector = explain language, English chrome.

Still open: deploy, live mic/STT, Oromo UI/voice, CI require-check (admin), browser click-through, backup video/PNG files.

---

## 2026-09-24 — CI smoke + Amharic demo text

- CI runs `db:seed` + `smoke:local` after tests.
- Demo script Amharic text step; screenshot shot list (no images yet).

Still open: deploy, live mic/STT, Oromo, CI require-check (admin), browser click-through, backup video/PNG files.

---

## 2026-09-24 — Amharic text UX + smoke:local

- Ask HULUM Amharic chrome/quick actions (text only).
- `npm run smoke:local` for local Abeba→A2SV APPLY check.

Still open: deploy, live mic, Amharic STT / second-language e2e, CI require-check, browser tests, backup video.

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

- HMAC session (`SESSION_SECRET` / `X-Hulum-Session`) for owned API routes; required in production.
- RLS owner policies in migration 004 (table-owner API still bypasses until a non-owner role).
- Fixed gateway UUID → profile create (POST with `userId`, not PATCH of missing row).
- **Not claimed:** OAuth/JWT provider login, live Voxide mic, or a public deploy.

Still **open on purpose** (need real external evidence or product work):

| Item | Why |
|---|---|
| Second/third language, mixed-language tests | ADR 004 — English e2e only |
| Live Voxide mic / voice response / demonstrate voice | Needs publishable key + mic pass |
| Deploy / production secrets / production verify | No public host |
| Browser/device / microphone test | Not run |
| Block merges when checks fail | CI runs on PR; required branch protection not verified from this pass |
| Backup video/screenshots | Not captured |
| ScholarXIV live Papers API citations | No live paper pull claimed |

Auth gateway / recovery / induction UIs on `/`, `/forgot-password`, `/verify` remain **UI previews**; API session HMAC is the real v0.1 auth when `SESSION_SECRET` is set.

---

## 2026-09-24 honesty sync

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
| Second/third language, mixed-language tests | ADR 004 — English e2e only |
| Live Voxide mic / voice response / demonstrate voice | Needs publishable key + mic pass |
| Deploy / production secrets / production verify | No public host |
| Browser/device / microphone test | Not run |
| JWT authentication + authorization | Local UUID only; gateway UIs are previews |
| Per-user RLS policies | Opportunities public-read only; user-scoped policies wait for auth |
| Block merges when checks fail | CI runs on PR; required branch protection not verified from this pass |
| Backup video/screenshots | Not captured |
| ScholarXIV live Papers API citations | No live paper pull claimed |

Auth gateway / recovery / induction UIs on `/`, `/forgot-password`, `/verify` are **UI only** — they do not close Phase 19 auth checkboxes.

---

## Earlier Day 20 freeze (2026-09-19)

See git history for the original freeze note. Product features have landed since; this file is the current honesty index.
