# Git history review (Day 20)

**Date:** 2026-09-19  
**Tip reviewed:** `feat/task-status` (`2c822ac`) after merge of `origin/main`  
**Rule:** describe the repository as it is. Do not rewrite commits or invent merges.

---

## Result

The Git history is **real**. It does not invent ScholarXIV papers, a production host, or live Voxide.

Kidist pushes on this stack do **not** include `Co-authored-by: Cursor <cursoragent@cursor.com>` (checked on the recent `feat/*` bodies). Authors are `kikemal` and `MULUALEM MEKONIN`.

`main` is **not** the full product. Judges must look at stacked `feat/*` branches.

---

## What is on `origin/main`

Merged PRs:

| PR | What |
|---|---|
| #1 | Team assignments + git workflow docs |
| #2 | Express backend scaffold + health |
| #3 | PostgreSQL v1 schema, `db:migrate`, `db:smoke` |
| #4 | `@hulum/shared` Task 22 lock (`enums` / envelope builders). Running app still uses `constants.ts` + Zod; voice parser still emits `SHOW_GAPS` |

Early files on `main` also include README, `task.md` rename, and `rule.md`. The running Next.js app, decision engine, Ask HULUM, and Day 19 docs are **not** all on `main` yet.

---

## What lives on stacked branches

Kidist work after the backend scaffold is a chain of `feat/*` and `docs/*` branches (product, research, web, voice-text, API tests, demo, STARK docs, Day 20 task status). Latest reviewed tip: `feat/task-status`.

Mulualem’s schema is on `main` and was merged into `feat/backup-demo` so later Kidist branches include it.

Do not treat unmerged branches as if they were squash-merged. Do not backfill fake PR numbers for those branches.

---

## What this review does not claim

- Every feature branch is on `main`
- Milestone tags (`v0.8.0` / `v1.0.0`) exist
- Cursor is a GitHub contributor on Kidist commits
- History was rewritten to look cleaner

---

## Git workflow

§39: the repository should tell the truth about how HULUM was built. This pass: it does, if you follow branches plus `CHANGELOG.md`, not `main` alone.
