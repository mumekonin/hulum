# How HULUM was built (development narrative)

**Team:** Kidist + Mulualem  
**Written:** 2026-09-19 · **Updated:** 2026-10-02  
**Rule:** this is a summary of the repository. It does not invent papers, a host, or live speech.

Full trace: `CHANGELOG.md` and `docs/stark/git-history.md`.

---

## The problem we kept

Ethiopian students can find scholarships and fellowships. They still waste time on ones they cannot use. HULUM is a **decision** agent: APPLY / MAYBE / SKIP, then why, gaps, and what to prepare. Official organization pages stay the eligibility authority.

Rejected paths (marketplace, auto-apply, chatbot-as-product) are in `docs/research/ideation.md`.

---

## What each person shipped (and where it lives now)

**Mulualem:** Express scaffold, Postgres schema + migrate/smoke, `@hulum/shared` lock, opportunity / profile / matching / decision / analysis / readiness services, investigator worker, JWT/Google auth paths — on tip of `main`.

**Kidist:** product and STARK docs, Next.js UI (welcome, sign-in, onboarding, Discover, Ask HULUM), Amharic text chrome, screenshot analyze, demo walkthrough, CI browser smoke — also on tip of `main`.

Early weeks used stacked `feat/*` and a file-store demo. That split is historical. Judges who clone **`main` today** get the running product (`npm run dev` → web `:3000` + API `:3001` on Postgres).

---

## Runtime (current)

| Piece | Fact |
|---|---|
| Store | Postgres (`createApp({ store: "postgres" })`) |
| Catalog | Investigator-filled; curated `db:seed` closed |
| Auth | Email/password JWT (+ optional Google) in `X-Hulum-Session` |
| Decision | `decision/decide.ts` only |
| Explain | Optional Groq wording of a stored analysis |
| File-store | Tests only — not `npm run dev` |

---

## Voice and language

Ask HULUM is keyword intents + text (optional Voxide widget when `NEXT_PUBLIC_VOXIDE_KEY` is set). Live mic STT/TTS is not claimed. English is the stable path (ADR 004). Amharic quick-action strings exist; Oromo is explain-language only — no invented Oromo chrome.

---

## Research

ScholarXIV space and planned queries: `docs/research/scholarxiv.md`. **No papers were retrieved** into the product. Competitive notes were live-checked 2026-09-18; unverified names were left off.

---

## What we did not finish

- Production deploy / EthioDeploy
- Live Voxide mic / Amharic STT
- Afaan Oromo UI/voice
- Required GitHub status checks on `main` (admin)
- Checked-in backup video / screenshot PNG pack
- Password-reset email
- API as non-owner so RLS owner-bypass is gone

Milestone git tags: see `docs/stark/milestones.md` (`milestone/*` on real commits; no fake SemVer release).

The product loop runs locally: welcome → Create account → onboarding / profile → Discover (or `/screenshot`) → APPLY/MAYBE/SKIP → official source.
