# Final changelog (Day 20)

**Date:** 2026-09-19  
**File:** `CHANGELOG.md`  
**Checked against:** `git log` on `feat/final-changelog` (includes `origin/main` through PR #10)

This pass does **not** rewrite older entries. Task 28’s note that GET readiness stays empty until Task 29 is left as written; Task 29 landed later the same day.

---

## Result

`CHANGELOG.md` matches real work. It does not invent ScholarXIV papers, a production host, live Voxide, or merges that did not happen.

Mulualem PRs #1–#10 are on `main` and are listed. Kidist demo/docs/API tests remain on stacked `feat/*` until those branches are reviewed into `main`.

---

## Two runtimes (do not collapse in the changelog)

| Path | What judges get with `npm run dev` |
|---|---|
| JSON file store | Default `createApp()` — Abeba, A2SV APPLY, Ask HULUM text |
| Postgres services | Mulualem routers + `DATABASE_URL` — not the default demo process |

Both decision implementations exist: `apps/server/src/decision/engine.ts` (file store) and `decide.ts` (Postgres path). The changelog records both as they were built.

Voice: running parser still emits `SHOW_GAPS`. Task 22 lock name is `SHOW_MISSING_REQUIREMENTS`. That split is documented; it was not silently renamed in this freeze.

---

## Still absent (correct)

- Retrieved ScholarXIV papers
- EthioDeploy / live URL
- Microphone / Voxide STT
- SemVer product releases `v0.8.0` / `v1.0.0` (honest `milestone/*` tags: `docs/stark/milestones.md`)
- Every Kidist `feat/*` branch on `main`

---

## Git workflow §23

Mulualem entries include contributor, branch, and decision. Kidist Day 19/20 entries include date and why. Missing PR numbers for unmerged Kidist branches were not invented.
