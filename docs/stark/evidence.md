# STARK evidence index

**Team:** Kidist + Mulualem  
**Repo:** https://github.com/mumekonin/hulum  
**Purpose:** a judge can follow problem → research → decisions → implementation → working product **without invented papers or a fake deploy**.

This is an index, not a new research study. Empty ScholarXIV rows stay empty.

**Submission cover:** `docs/stark/README.md`.

Kidist slices after Mulualem’s `main` merge live on stacked `feat/*` branches until they are reviewed into `main`. Look at GitHub branches, not only `main`.

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
| Database | `database/migrations/001_init.sql`–`004`, ADR 001 | Schema + migrate/smoke; **`npm run dev` uses Postgres** |
| Decision engine | `apps/server/src/decision/`, ADR 002 | Present + tests |
| AI responsibility | ADR 001/002, Groq validation in `apps/server/src/ai/` | Engine decides; Groq explains stored analysis only |
| Voice UX | ADR 003, ADR 004, `docs/demo/script.md`, `docs/research/voxide-integration.md` | Text/quick-action fallback; `@voxide/react` widget behind `NEXT_PUBLIC_VOXIDE_KEY` (no mic claim without a live key) |
| Auth / session | `apps/server/src/security/session.ts` | HMAC `X-Hulum-Session` when `SESSION_SECRET` set; required in production |
| Implementation | `apps/web`, `apps/server`, `packages/shared` | Present |
| Testing | `npm test` in `apps/server` | Engine, API, voice-text, failures, English product tests |
| Iteration | `CHANGELOG.md`, `docs/stark/narrative.md` | Present; Day 20 narrative; do not rewrite history |
| Deployment | `docs/stark/deployment.md` | **Not deployed**; local + config docs only |
| Demo | `docs/demo/script.md`, `docs/demo/backup.md`, `docs/demo/rehearsal.md`, `docs/demo/screenshots/README.md` | Abeba Tesfaye; Amharic text demo step; screenshot shot list (no PNGs yet); text/API backup; **no video** |
| Changelog | `CHANGELOG.md`, `docs/stark/changelog-review.md`, `docs/stark/changelog-final.md` | Present; Day 20 freeze pass 2026-09-19 |
| Git history | this GitHub repo, `docs/stark/git-history.md`, `docs/stark/milestones.md` | Real commits; `milestone/*` tags on real SHAs; no invented SemVer product release |
| Team | `team_assignments.md`, `git-workflow.md` | Present |

---

## Gaps (do not paper over)

1. ScholarXIV Papers API is proxied on `/research`; MCP is not used in Analyze. The paper table stays empty until a teammate copies a live result (`docs/research/scholarxiv.md`).
2. No production host. CORS/`CLIENT_URL` and `SESSION_SECRET` are configured for production; health is local.
3. Live Voxide mic STT/TTS is not claimed without a publishable key + mic pass. Demo uses Ask HULUM text; widget mounts only when `NEXT_PUBLIC_VOXIDE_KEY` is set.
4. Per-user RLS policies exist for non-owner roles; the API still connects as table owner (owner bypasses RLS).
5. Not all historical `feat/*` branches are on `main`; tip of `main` is the source of truth.
---

## Demo pointer

Walkthrough: `docs/demo/script.md`.  
Backup if speech, Analyze, or the UI fails: `docs/demo/backup.md`.  
Rehearsal (tests + copy, not a live browser pass): `docs/demo/rehearsal.md`.  
Persona: Abeba Tesfaye — A2SV APPLY, UCT MAYBE, Chevening SKIP.

---

## How to update this file

Add a row or fix a status only in the same commit as the real artifact. Never add paper titles, deploy URLs, or competitor quotes that were not verified.
