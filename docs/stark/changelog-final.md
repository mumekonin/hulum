# Final changelog (Day 20)

**Date:** 2026-09-19  
**Updated note:** 2026-10-02 — tip of `main` is now the running product; this freeze note is historical.  
**File:** `CHANGELOG.md`  
**Checked against (freeze day):** `git log` on `feat/final-changelog` (includes `origin/main` through PR #10)

This pass does **not** rewrite older CHANGELOG entries. Task 28’s note that GET readiness stays empty until Task 29 is left as written; Task 29 landed later the same day.

---

## Result (freeze day)

`CHANGELOG.md` matched real work. It did not invent ScholarXiv papers, a production host, live Voxide, or merges that did not happen.

On 2026-09-19, Mulualem PRs #1–#10 were on `main` and Kidist demo/docs/API tests were still on stacked `feat/*`. **That split is no longer current** — tip of `main` now includes JWT auth, product UI, investigator catalog, and CI smokes. Follow root `CHANGELOG.md` + tip of `main`.

---

## Two runtimes (historical freeze note)

On freeze day, file-store was still described as a demo path beside Postgres. **Today:** `npm run dev` defaults to Postgres (`createApp({ store: "postgres" })`). File-store remains for unit tests only. Both decision implementations still exist: `decision/engine.ts` (file store tests) and `decide.ts` (product path).

---

## Still absent (correct)

- Retrieved ScholarXiv papers
- EthioDeploy / live URL
- Microphone / Voxide STT as a verified claim without a keyed pass
- SemVer product releases `v0.8.0` / `v1.0.0` (honest `milestone/*` tags: `docs/stark/milestones.md`)

---

## Git workflow §23

Mulualem entries include contributor, branch, and decision. Kidist Day 19/20 entries include date and why. Missing PR numbers for unmerged Kidist branches were not invented on freeze day.
