# HULUM — STARK submission package

**Team Ethiopian Builders** — Kidist (product, web, demo) and Mulualem (API, database, engine on `main`)  
**Repo:** https://github.com/mumekonin/hulum  
**Hackathon:** STARK 2026

This folder is the judge entry. It does not invent ScholarXIV papers. The live site is [https://hulum-alpha.vercel.app](https://hulum-alpha.vercel.app). The API is [https://hulum-api.onrender.com](https://hulum-api.onrender.com).

**Source of truth:** tip of `main` (Postgres, JWT, welcome → `/sign-in` → onboarding, Discover, investigator catalog). Open stacked `feat/*` only for unmerged work.

---

## Start here (about 10 minutes)

| Order | Open | Why |
|---|---|---|
| 1 | This file | Scope and gaps |
| 2 | `docs/product/problem.md` | Why APPLY / MAYBE / SKIP |
| 3 | `docs/research/ideation.md` | What was rejected |
| 4 | `docs/architecture/overview.md` | What actually runs |
| 5 | `docs/product/opportunity-verification.md` | Manual verify + stale rules |
| 6 | `docs/stark/deployment.md` | Vercel site and Render API |
| 7 | `docs/demo/script.md` | Abeba Tesfaye walkthrough |
| 8 | `docs/stark/evidence.md` | Task 47 map |
| 9 | `docs/stark/narrative.md` | How it was built (honest) |
| 10 | `docs/stark/milestones.md` | `milestone/*` tags on real commits |

Then run locally (README at repo root): `npm install` → `npm run dev` → http://localhost:3000

Backup if the UI fails: `docs/demo/backup.md`. Rehearsal notes: `docs/demo/rehearsal.md`.

---

## What v0.1 proves

A student can open the welcome page, **Create account** (JWT), complete onboarding (or type Abeba facts), browse investigator-filled opportunities on Discover (list may be empty until the worker runs), get **APPLY / MAYBE / SKIP** from a TypeScript engine when a card exists, see why / gaps / readiness, and open the official source — or use `/screenshot` when the catalog is empty. Ask HULUM uses the same engine over text.

Do **not** expect a one-click demo profile or seeded A2SV / UCT / Chevening cards.

---

## What this package does not claim

- Retrieved ScholarXIV papers (`docs/research/scholarxiv.md` is empty on purpose)
- An EthioDeploy URL
- Measured Amharic or Afaan Oromo speech recognition
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
