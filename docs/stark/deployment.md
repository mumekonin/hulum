# Deployment decision (v0.1)

**Status:** not deployed. There is no EthioDeploy URL, no public API host, and no production database for judges to open.

## Decision

HULUM v0.1 runs **locally** with `npm install` → set `DATABASE_URL` / `CLIENT_URL` → `npm run db:migrate` → `npm run dev`.

| Piece | Host |
|---|---|
| Web | `http://localhost:3000` |
| API | `http://localhost:3001` |
| Store | Postgres via `DATABASE_URL` (local or team Supabase project — not a public demo URL) |

## Why not EthioDeploy yet

Phase 23 asked for a deployment decision. Shipping a fake public URL would break the STARK evidence rule. Production CORS (`CLIENT_URL`), env validation, and secrets handling are already in the API code; they are ready when a real host exists.

## What judges should run

Follow the root `README.md`. Optional Groq keys only affect explanation wording. APPLY / MAYBE / SKIP still come from `decide()`.

## What is still open

- Deploy frontend / backend (P0) — blocked on a real host
- Production secrets on that host
- Production analysis and voice verification on that host
- Branch-protection “block merges” — not claimed here; CI runs on push/PR only
