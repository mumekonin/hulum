# Git history review

**First written:** 2026-09-19 (Day 20 freeze)  
**Updated:** 2026-09-25  
**Rule:** describe the repository as it is. Do not invent merges or SemVer product releases.

---

## Result (current)

The Git history is **real**. It does not invent ScholarXIV papers, a production host, or live Voxide.

**Tip of `main` is the source of truth** for the running product (Postgres, JWT auth, Next.js, investigator catalog, smokes). Open `feat/*` only for work not yet merged.

Author names on recent commits are human accounts (e.g. `kikemal`, `Mulualem Mekonin`). Do not treat Cursor as a product contributor.

---

## How `main` grew (historical)

Early Mulualem PRs built the backend foundation:

| PR | What |
|---|---|
| #1 | Team assignments + git workflow docs |
| #2 | Express backend scaffold + health |
| #3 | PostgreSQL v1 schema, `db:migrate`, `db:smoke` |
| #4 | `@hulum/shared` Task 22 lock |
| #5 | Opportunity read API (Postgres) |
| #6 | Profile create/read/update API (Postgres) |
| #7 | Requirement matching engine |
| #8 | APPLY/MAYBE/SKIP decision engine |
| #9 | Analysis persist API |
| #10 | Readiness checklist engine |

Later merges brought JWT/Google auth, investigator catalog (seed closed), profile documents, Next.js site routes, Ask HULUM, screenshot analyze, and CI `smoke:local` / `smoke:browser`. File-store was the early demo path; it is **not** what `npm run dev` uses now.

---

## What this review does not claim

- Every historical `feat/*` branch tip is still open or needed
- Milestone tags (`v0.8.0` / `v1.0.0`) as product releases — see `docs/stark/milestones.md` for honest `milestone/*` tags instead
- Branch protection / required checks are enabled (admin step — `docs/ops/branch-protection.md`)
- History was rewritten only to look prettier (authorship cleanup of Cursor co-author trailers, if present, is separate from inventing features)

---

## Git workflow

§39: the repository should tell the truth about how HULUM was built. Follow tip of `main` + `CHANGELOG.md`. Use stacked branches only for unmerged work.
