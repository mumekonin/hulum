# Research → product decision links

**Status:** closes Phase 2 P1 “Link research findings to product decisions”  
**Date:** 2026-09-24  
**Sources:** `docs/research/*`, `docs/product/*`, `docs/decisions/*`  
**Rule:** map only what the repo already records. Do not invent papers, hosts, or mic results.

## Why this file exists

STARK expects research to change the product, not sit in a folder. Each row ties a research note to a locked decision or shipped behavior.

| Research / evidence | Product decision or ADR | What shipped |
|---|---|---|
| Opportunity discovery is noisy; eligibility is unclear (`docs/product/problem.md`) | Decision + readiness layer, not another catalog | APPLY / MAYBE / SKIP + readiness checklist |
| Competitors match profiles; “AI matching” is not unique (`docs/research/competitive-analysis.md`) | Do not claim uniqueness on matching; own the decision/uncertainty/readiness story | Engine + MET / NOT_MET / UNCERTAIN + official source notice |
| Informal Telegram/Facebook groups lack verification | Curated official-source opportunities only | Seed catalog + verification timestamps; no scrape invent |
| Voice-first Amharic/Oromo aspiration vs available tools (`docs/research/voxide-languages.md`) | English e2e first; languages in contracts for later | ADR 004; `LanguageCode` `en`/`am`/`om`; P1 languages stay open |
| Voxide is a browser widget, not a server STT API (`docs/research/voxide-integration.md`) | Tools `fetch` HULUM APIs; no fake Voxide backend | ADR 001 / 003; text/quick-action fallback; optional widget behind key |
| Claude-as-decider is unauditable / cost | Deterministic engine; Groq explains stored analysis only | ADR 001; guards reject invented URLs / decision flips |
| ScholarXIV Papers API / MCP explored, no live paper run | Ideation evidence in-repo; do not claim unread papers | `docs/research/ideation.md`; research checkboxes stay honest |
| EthioDeploy / public host not available | Document local-only deploy decision | `docs/stark/deployment.md`; production deploy P0s stay open |
| Auth/RLS without JWT | Local `userId` UUID for demo; per-user RLS waits | Gateway UI previews; `docs/architecture/data-exposure.md` |

## Explicit non-links (still open on purpose)

These research hopes are **not** marked done in `task.md`:

- Live Voxide mic STT/TTS demo
- Verified Amharic / Afaan Oromo voice quality
- Production host / EthioDeploy smoke
- JWT auth + owner RLS policies
- Fresh ScholarXIV paper citations from a live API call

## Judge path

`docs/product/problem.md` → this table → `docs/product/hulum-flow.md` → Analyze on `/opportunities` (local).
