# How HULUM was built (development narrative)

**Team:** Kidist + Mulualem  
**Written:** 2026-09-19  
**Rule:** this is a summary of the repository. It does not invent papers, a host, or live speech.

Full trace: `CHANGELOG.md` and `docs/stark/git-history.md`.

---

## The problem we kept

Ethiopian students can find scholarships and fellowships. They still waste time on ones they cannot use. HULUM is a **decision** agent: APPLY / MAYBE / SKIP, then why, gaps, and what to prepare. Official organization pages stay the eligibility authority.

Rejected paths (marketplace, auto-apply, chatbot-as-product) are in `docs/research/ideation.md`.

---

## What each person actually shipped

**Mulualem (`main`, PRs #1–#10):** Express scaffold, Postgres schema + migrate/smoke, `@hulum/shared` Task 22 lock, then Postgres-backed opportunity, profile, matching, decision, analysis, and readiness services.

**Kidist (stacked `feat/*`):** product docs, Next.js UI, file-store vertical slice (Abeba → A2SV APPLY), Ask HULUM text/quick actions, optional Claude explanation that cannot change the engine, STARK demo and evidence files.

Judges who clone only `main` will not see the web demo. Look at branches.

---

## Two runtimes (on purpose, for now)

| Demo (`npm run dev`) | Mulualem services |
|---|---|
| JSON file store, seed catalog | Postgres when `DATABASE_URL` is set |
| `createApp()` in `apps/server/src/app.ts` | routers under `profiles/`, `analysis/`, … |
| `decision/engine.ts` | `decision/decide.ts` |

v0.1 walkthrough uses the file store. The schema on `main` is real; the demo process does not switch stores automatically.

---

## Voice and language

Ask HULUM is keyword intents + text. Gaps use `SHOW_MISSING_REQUIREMENTS` (Task 22). Voxide STT/TTS is not connected. English is the stable path (ADR 004). Amharic quick-action strings exist; live Amharic speech is not claimed.

---

## Research

ScholarXIV space and planned queries: `docs/research/scholarxiv.md`. **No papers were retrieved.** Competitive notes were live-checked 2026-09-18; unverified names were left off.

---

## What we did not finish

- Production deploy / EthioDeploy
- Clean-browser/device pass in this freeze
- Native mobile (Task 14, out of v0.1)
- Full login/RLS
- Milestone git tags

The product loop still runs locally: profile → opportunity → APPLY/MAYBE/SKIP → official source.
