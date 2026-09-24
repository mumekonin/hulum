# Deployment guide (v0.1)

**Status:** not deployed. There is no EthioDeploy URL, no public API host, and no production database for judges to open.

This file is the Phase 26 **deployment guide** and the Phase 23 **deployment decision**.

## Decision

HULUM v0.1 runs **locally** with:

```bash
npm install
# copy .env.example → .env; set DATABASE_URL and CLIENT_URL=http://localhost:3000
npm run db:migrate
npm run dev
```

| Piece | Host |
|---|---|
| Web | `http://localhost:3000` |
| API | `http://localhost:3001` |
| Store | Postgres via `DATABASE_URL` (local or team Supabase project — not a public demo URL) |

Optional: `GROQ_API_KEY` for explanation wording; `NEXT_PUBLIC_VOXIDE_KEY` (`vox_pub_…`) for the Ask HULUM widget. APPLY / MAYBE / SKIP still come from `decide()`.

## Why not EthioDeploy yet

Phase 23 asked for a deployment decision. Shipping a fake public URL would break the STARK evidence rule. Production CORS (`CLIENT_URL`), env validation, and secrets handling are already in the API code; they are ready when a real host exists. EthioDeploy is optional and **not practical** for this build window without inventing a host.

## Production configuration (ready; not hosted)

These Phase 23 rows mean **configuration exists in code/docs**, not that a public host is live.

### Configure database

1. Provision Postgres (local Docker or team Supabase).
2. Set `DATABASE_URL` in the server environment (never commit it).
3. Run `npm run db:migrate --workspace @hulum/server` (applies `001`–`004`, including RLS policies).
4. Optional: `npm run db:smoke` (transactional insert/rollback).
5. Seed only curated official-source opportunities — do not invent listings.

### Configure production secrets

Required before any public host:

| Secret / env | Purpose |
|---|---|
| `DATABASE_URL` | Postgres |
| `CLIENT_URL` | CORS origin (required in `NODE_ENV=production`) |
| `SESSION_SECRET` | HMAC for `X-Hulum-Session` (required in production) |
| `GROQ_API_KEY` / `GROQ_MODEL` | Optional explanation wording |
| `NEXT_PUBLIC_VOXIDE_KEY` | Optional Ask HULUM widget (`vox_pub_…`) |
| `INVESTIGATE_ADMIN_SECRET` | Optional investigator admin header |
| `SCHOLARXIV_API_KEY` | Optional research API (server only) |

Names live in `.env.example` / `apps/server/.env.example`. Real values stay in the host secret store.

### Still open until a host exists

- Deploy frontend / backend
- Verify production analysis / voice flows on that host

## Deployment workflow (CI)

GitHub Actions CI (`.github/workflows/ci.yml`) already runs install, migrations, typecheck, lint, tests, and web/server builds on every push and pull request.

**Configure deployment workflow:** not appropriate for v0.1 — there is no production host to deploy to. Do not add a deploy job that invents a URL.

**Block merges when checks fail:** CI runs on PRs, but requiring the check via GitHub branch protection needs org/repo admin. Until an admin enables **Settings → Branches → Require status checks to pass → job `check` (workflow CI)**, merges are not mechanically blocked. Do not claim branch protection is on.

## What judges should run

Follow the root `README.md`. Demo backup path: `docs/demo/backup.md` (text-only if voice fails). Research evidence index: `docs/stark/research-evidence.md`.

## What is still open (honest)

- Deploy frontend / backend (P0) — blocked on a real host
- Production analysis and voice verification on that host
- Org admin enabling required status checks on `main`
- Live Voxide mic / Amharic STT