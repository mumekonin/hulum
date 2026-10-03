# HULUM — STARK submission package

**Team Ethiopian Builders** — Kidist (product, web, demo) and Mulualem (API, database, engine on `main`)  
**Repo:** https://github.com/mumekonin/hulum  
**Hackathon:** STARK 2026

This folder is the judge entry. It does not invent ScholarXIV papers, a production URL, or live Voxide.

**Look at GitHub branches, not only `main`.** Kidist’s web app, demo docs, and file-store API tests live on stacked `feat/*` until they are reviewed into `main`. `main` has Mulualem PRs #1–#10 (scaffold, schema, contracts, Postgres services).

---

## Start here (about 10 minutes)

| Order | Open | Why |
|---|---|---|
| 1 | This file | Scope and gaps |
| 2 | `docs/product/problem.md` | Why APPLY / MAYBE / SKIP |
| 3 | `docs/research/ideation.md` | What was rejected |
| 4 | `docs/architecture/overview.md` | What actually runs |
| 5 | `docs/product/opportunity-verification.md` | Manual verify + stale rules |
| 6 | `docs/stark/deployment.md` | Local-only; no EthioDeploy URL |
| 7 | `docs/demo/script.md` | Abeba Tesfaye walkthrough |
| 8 | `docs/stark/evidence.md` | Task 47 map |
| 9 | `docs/stark/narrative.md` | How it was built (honest) |
| 10 | `docs/stark/milestones.md` | `milestone/*` tags on real commits |

Then run locally (README at repo root): `npm install` → `npm run dev` → http://localhost:3000

Backup if the UI fails: `docs/demo/backup.md`. Rehearsal notes: `docs/demo/rehearsal.md`.

---

## What v0.1 proves

A student can **Create account** (JWT), type a profile (e.g. Abeba facts), browse investigator-filled opportunities (list may be empty until the worker runs), get **APPLY / MAYBE / SKIP** from a TypeScript engine when a card exists, see why / gaps / readiness, and open the official source — or use `/screenshot` when the catalog is empty. Ask HULUM uses the same engine over text.

Do **not** expect a one-click demo profile or seeded A2SV / UCT / Chevening cards.

---

## What this package does not claim

- Retrieved ScholarXIV papers (`docs/research/scholarxiv.md` is empty on purpose)
- Production / EthioDeploy
- Microphone or Voxide speech without a live keyed pass
- Seeded catalog APPLY / MAYBE / SKIP labels
- A recorded demo video

---

## Other files in this folder

| File | Role |
|---|---|
| `evidence.md` | Task 47 index |
| `task-status.md` | Honesty index (append-only; tip of `main`) |
| `git-history.md` | Branches vs `main` |
| `changelog-review.md` | Day 19 changelog check |
| `changelog-final.md` | Day 20 changelog check |
| `narrative.md` | How HULUM was built |

Changelog: `CHANGELOG.md` at the repo root. Do not rewrite it.
