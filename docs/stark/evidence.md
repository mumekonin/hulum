# STARK evidence index

**Team:** Kidist + Mulualem  
**Repo:** https://github.com/mumekonin/hulum  
**Purpose:** a judge can follow problem → research → decisions → implementation → working product **without invented papers or a fake deploy**.

This is an index, not a new research study. Empty ScholarXIV rows stay empty.

Kidist slices after Mulualem’s `main` merge live on stacked `feat/*` branches until they are reviewed into `main`. Look at GitHub branches, not only `main`.

---

## Evidence map (Task 47)

| Area | Where | Status |
|---|---|---|
| Problem | `docs/product/problem.md` | Present |
| Research questions | `docs/product/research-questions.md` | Present (hypotheses labeled) |
| ScholarXIV | `docs/research/scholarxiv.md` | Space only — **no papers retrieved** |
| Ideation + rejected ideas | `docs/research/ideation.md` | Present |
| Competitors | `docs/research/competitive-analysis.md` | Live-checked 2026-09-18; do not invent extra claims |
| Product requirements | `task.md`, `docs/stark/task-status.md` | Present; Day 20 status pass 2026-09-19 |
| Architecture | `docs/architecture/overview.md` | Present (as built) |
| Database | `database/migrations/001_init.sql`, ADR 001 | Schema + migrate/smoke on `main`; **file store in the running API** |
| Decision engine | `apps/server/src/decision/`, ADR 002 | Present + tests |
| AI responsibility | ADR 002, Claude validation in `apps/server/src/ai/` | Engine decides; Claude explains only |
| Voice UX | ADR 003, ADR 004, `docs/demo/script.md` | Text/quick-action fallback; Voxide unwired |
| Implementation | `apps/web`, `apps/server`, `packages/shared` | Present |
| Testing | `npm test` in `apps/server` | Engine, API, voice-text, failures |
| Iteration | `CHANGELOG.md` | Present; Day 20 final pass; do not rewrite history |
| Deployment | README production table | **Not deployed** |
| Demo | `docs/demo/script.md`, `docs/demo/backup.md`, `docs/demo/rehearsal.md` | Abeba Tesfaye; text/API backup; rehearsal 2026-09-19 via tests, **no video** |
| Changelog | `CHANGELOG.md`, `docs/stark/changelog-review.md`, `docs/stark/changelog-final.md` | Present; Day 20 freeze pass 2026-09-19 |
| Git history | this GitHub repo, `docs/stark/git-history.md` | Real commits; Kidist pushes without Cursor co-author; **most Kidist `feat/*` not on `main`** |
| Team | `team_assignments.md`, `git-workflow.md` | Present |

---

## Gaps (do not paper over)

1. ScholarXIV Papers API / MCP has not been run. Planned queries are in `docs/research/scholarxiv.md`.
2. No production host. CORS/`CLIENT_URL` are configured; health is local.
3. Voxide STT/TTS is not connected. Demo uses Ask HULUM text.
4. Full login/RLS is P1. v0.1 uses a local `userId`.
5. Not all Kidist `feat/*` branches are on `main` yet.

---

## Demo pointer

Walkthrough: `docs/demo/script.md`.  
Backup if speech, Analyze, or the UI fails: `docs/demo/backup.md`.  
Rehearsal (tests + copy, not a live browser pass): `docs/demo/rehearsal.md`.  
Persona: Abeba Tesfaye — A2SV APPLY, UCT MAYBE, Chevening SKIP.

---

## How to update this file

Add a row or fix a status only in the same commit as the real artifact. Never add paper titles, deploy URLs, or competitor quotes that were not verified.
