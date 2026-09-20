# Changelog review (Day 19)

**Date:** 2026-09-19  
**Reviewed file:** `CHANGELOG.md`  
**Checked against:** `git log` on `feat/changelog-review` (includes stacked Kidist `feat/*` work)

This is a review, not a rewrite. Old entries stay as written.

---

## Result

`CHANGELOG.md` matches real commits. It does not invent ScholarXIV papers, a production host, live Voxide, or Git history.

STARK template fields that are often missing (contributor name, issue/PR number, screenshot) were left blank. Those numbers and screenshots were not invented.

---

## What the changelog actually records

| Claim in changelog | Repo |
|---|---|
| Next.js + Express + shared engine | `apps/web`, `apps/server`, `packages/shared` |
| APPLY / MAYBE / SKIP from TypeScript | `apps/server/src/decision/` |
| Claude explains only, JSON-validated | `apps/server/src/ai/` |
| Voice is text/quick-action fallback | ADR 003, `/assistant` |
| English is the stable language | ADR 004 |
| Official source + disclaimer | analysis UI + API tests |
| File store default | ADR 001, `STORE_PATH` |
| Production needs `CLIENT_URL` | `apps/server/src/config/env.ts` |
| Architecture as built | `docs/architecture/overview.md` (reviewed 2026-09-19) |
| ScholarXIV space, empty table | `docs/research/scholarxiv.md` |

---

## What is still not in the changelog (correctly)

- Retrieved ScholarXIV papers
- EthioDeploy / live URL
- Microphone or Voxide STT/TTS
- Merge of every Kidist `feat/*` branch into `main`

Kidist Day 19 work lives on stacked feature branches until reviewed into `main`. Judges should use GitHub branches plus this changelog, not `main` alone.

---

## Git workflow §23

Preferred fields: date, contributor, change, why, evidence, decision.

This pass: dates and why are present on 2026-09-18/19 entries. Contributor/PR/screenshot stay omitted unless they already existed (Mulualem backend scaffold names a branch). Do not backfill fake PRs.
