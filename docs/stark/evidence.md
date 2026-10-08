# STARK evidence index

**Team:** Kidist + Mulualem  
**Repo:** https://github.com/mumekonin/hulum  
**Purpose:** a judge can follow problem → research → decisions → implementation → working product **without invented papers or a fake deploy**.

This is an index, not a new research study. Empty ScholarXIV rows stay empty.

**Submission cover:** `docs/stark/README.md`.

**Source of truth:** tip of `main`. Open stacked `feat/*` only for unmerged work.

---

## Evidence map (Task 47)

| Area | Where | Status |
|---|---|---|
| Problem | `docs/product/problem.md` | Present |
| Research questions | `docs/product/research-questions.md` | Present (hypotheses labeled) |
| ScholarXIV | `docs/research/scholarxiv.md`, `/research` | Papers API proxy on the server. Live rows need `SCHOLARXIV_API_KEY` |
| Ideation + rejected ideas | `docs/research/ideation.md` | Present |
| Competitors | `docs/research/competitive-analysis.md` | Live-checked 2026-09-18; do not invent extra claims |
| Product requirements | `task.md`, `docs/stark/task-status.md` | Present; Day 20 status pass 2026-09-19 |
| Architecture | `docs/architecture/overview.md` | Present (as built) |
| Database | `database/migrations/001_init.sql`–`013`, ADR 001 | Schema + migrate/smoke; **`npm run dev` uses Postgres**; curated seed closed (`006`); investigator sources; saved opps; profile document text |
| Decision engine | `apps/server/src/decision/`, ADR 002 | Present + tests |
| AI responsibility | ADR 001/002, Groq validation in `apps/server/src/ai/` | Engine decides; Groq explains stored analysis only |
| Voice UX | ADR 003, ADR 004, `docs/demo/script.md`, `docs/research/voxide-integration.md` | Ask HULUM text always works. The microphone widget is on the signed-in site when `NEXT_PUBLIC_VOXIDE_KEY` is set and Voxide allows that domain. |
| Auth / session | `apps/server/src/auth/`, `apps/server/src/security/session.ts` | Email/password JWT (+ Google) in `X-Hulum-Session`. Password reset emails a single-use link when SMTP is set. |
| Implementation | `apps/web`, `apps/server`, `packages/shared` | Present |
| Testing | `npm test`, `npm run smoke:local`, `npm run smoke:browser`, CI | Engine, API, auth, voice-text tests; CI register + catalog list + Chromium click-through (no `db:seed` APPLY) |
| Iteration | `CHANGELOG.md`, `docs/stark/narrative.md` | Present; Day 20 narrative; do not rewrite history |
| Deployment | `docs/stark/deployment.md` | Site on Vercel, API on Render |
| Demo | `docs/demo/script.md`, `docs/demo/backup.md`, `docs/demo/rehearsal.md`, `docs/demo/screenshots/README.md` | Welcome → `/sign-in` → Create account / onboarding; typed Abeba; investigator catalog; `/screenshot` backup; shot list (no PNGs); **no video** |
| Changelog | `CHANGELOG.md`, `docs/stark/changelog-review.md`, `docs/stark/changelog-final.md` | Present; Day 20 freeze pass 2026-09-19 |
| Git history | this GitHub repo, `docs/stark/git-history.md`, `docs/stark/milestones.md` | Real commits; `milestone/*` tags on real SHAs; no invented SemVer product release |
| Team | `team_assignments.md`, `git-workflow.md` | Present |

---

## Gaps (do not paper over)

1. ScholarXIV Papers API is proxied on `/research`; MCP is not used in Analyze. The paper table stays empty until a teammate copies a live result (`docs/research/scholarxiv.md`).
2. The free Render API sleeps when idle. The investigator worker is off on that instance, so the catalog is whatever is already in Postgres.
3. The microphone connects only after the Voxide dashboard allows `https://hulum-alpha.vercel.app`. Ask HULUM text does not depend on that. Amharic and Oromo recognition quality is not a measured result.
4. Per-user RLS policies exist for non-owner roles; the API still connects as table owner (owner bypasses RLS).
5. Not all historical `feat/*` branches are on `main`; tip of `main` is the source of truth.
---

## Demo pointer

Walkthrough: `docs/demo/script.md`.  
Backup if speech, Analyze, or the UI fails: `docs/demo/backup.md`.  
Rehearsal (tests + copy, not a live browser pass): `docs/demo/rehearsal.md`.  
Persona: Abeba Tesfaye (typed profile). Catalog is investigator-filled — do not expect seeded A2SV / UCT / Chevening cards. Empty list → `/screenshot` backup.

---

## How to update this file

Add a row or fix a status only in the same commit as the real artifact. Never add paper titles, deploy URLs, or competitor quotes that were not verified.
