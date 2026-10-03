# Changelog review (Day 19)

**Date:** 2026-09-19  
**Updated note:** 2026-10-02 — tip of `main` is the product; this review is historical.  
**Reviewed file:** `CHANGELOG.md`  
**Checked against (review day):** `git log` on `feat/changelog-review`

This is a review, not a rewrite. Old CHANGELOG entries stay as written.

---

## Result (review day)

`CHANGELOG.md` matched real commits. It did not invent ScholarXiv papers, a production host, live Voxide, or Git history.

STARK template fields that are often missing (contributor name, issue/PR number, screenshot) were left blank. Those numbers and screenshots were not invented.

---

## What the changelog actually records

| Claim in changelog | Repo |
|---|---|
| Next.js + Express + shared engine | `apps/web`, `apps/server`, `packages/shared` |
| APPLY / MAYBE / SKIP from TypeScript | `apps/server/src/decision/` |
| Model explains only, guarded | `apps/server/src/ai/` |
| Voice is text/quick-action fallback (+ optional widget) | ADR 003, `/assistant` |
| English is the stable language | ADR 004 |
| Official source + disclaimer | opportunity detail + API tests |
| Postgres default for `npm run dev` | ADR 001 (file-store superseded for runtime), `DATABASE_URL` |
| Production needs `CLIENT_URL` / `SESSION_SECRET` | `apps/server/src/config/env.ts` |
| Architecture as built | `docs/architecture/overview.md` |
| ScholarXiv space, empty table | `docs/research/scholarxiv.md` |

---

## What is still not in the changelog (correctly)

- Retrieved ScholarXiv papers
- EthioDeploy / live URL
- Microphone or Voxide STT/TTS as verified without a keyed pass

On review day, Kidist work was still partly on stacked branches. **Today judges should use tip of `main` plus root `CHANGELOG.md`.**

---

## Git workflow §23

Preferred fields: date, contributor, change, why, evidence, decision.

This pass: dates and why are present on 2026-09-18/19 entries. Contributor/PR/screenshot stay omitted unless they already existed. Do not backfill fake PRs.
