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
| 5 | `docs/demo/script.md` | Abeba Tesfaye walkthrough |
| 6 | `docs/stark/evidence.md` | Task 47 map |

Then run locally (README at repo root): `npm install` → `npm run dev` → http://localhost:3000

Backup if the UI fails: `docs/demo/backup.md`. Rehearsal notes: `docs/demo/rehearsal.md`.

---

## What v0.1 proves

A student can create a profile (or load Abeba), open a curated opportunity, get **APPLY / MAYBE / SKIP** from a TypeScript engine, see why / gaps / readiness, and open the official source. Ask HULUM uses the same engine over text.

Expected demo labels: A2SV **APPLY**, UCT **MAYBE**, Chevening **SKIP**.

---

## What this package does not claim

- Retrieved ScholarXIV papers (`docs/research/scholarxiv.md` is empty on purpose)
- Production / EthioDeploy
- Microphone or Voxide speech
- That `main` alone is the full product
- A recorded demo video

---

## Other files in this folder

| File | Role |
|---|---|
| `evidence.md` | Task 47 index |
| `task-status.md` | Day 20 checkbox pass |
| `git-history.md` | Branches vs `main` |
| `changelog-review.md` | Day 19 changelog check |
| `changelog-final.md` | Day 20 changelog check |

Changelog: `CHANGELOG.md` at the repo root. Do not rewrite it.
