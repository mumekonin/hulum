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
| Catalog | Investigator worker (evidenced pages). **No** baked `db:seed` opportunity cards. |
| Auth | Email/password JWT (+ optional Google). Password-reset email is not wired. |

Optional: `GROQ_API_KEY` for explain / extract / screenshot vision; `NEXT_PUBLIC_VOXIDE_KEY` (`vox_pub_…`) for the Ask HULUM widget. APPLY / MAYBE / SKIP still come from `decide()`.

## Why not EthioDeploy yet

Phase 23 asked for a deployment decision. Shipping a fake public URL would break the STARK evidence rule. Production CORS (`CLIENT_URL`), env validation, and secrets handling are already in the API code; they are ready when a real host exists. EthioDeploy is optional and **not practical** for this build window without inventing a host.

## Production configuration (ready; not hosted)

These Phase 23 rows mean **configuration exists in code/docs**, not that a public host is live.

### Configure database

1. Provision Postgres (local Docker or team Supabase).
2. Set `DATABASE_URL` in the server environment (never commit it).
3. Run `npm run db:migrate --workspace @hulum/server` (applies `001`–`009`: init, investigator, audit, RLS, worker, close seed, password hash, Google sub, profile documents).
4. Optional: `npm run db:smoke` (transactional insert/rollback).
5. Do **not** rely on `db:seed` for the live catalog — migration `006` closed curated seed inserts. The investigator fills opportunities from evidenced pages when Groq + worker env are set.

### Configure production secrets

Required before any public host:

| Secret / env | Purpose |
|---|---|
| `DATABASE_URL` | Postgres |
| `CLIENT_URL` | CORS origin (required in `NODE_ENV=production`) |
| `SESSION_SECRET` | JWT for `X-Hulum-Session` (required in production) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth |
| `GROQ_API_KEY` / `GROQ_MODEL` | Optional explain / extract / investigator |
| `GROQ_VISION_MODEL` | Optional screenshot vision |
| `NEXT_PUBLIC_VOXIDE_KEY` | Optional Ask HULUM widget (`vox_pub_…`) |
| `INVESTIGATE_WORKER` / interval / on-start | Optional background investigator |
| `INVESTIGATE_ADMIN_SECRET` | Optional investigator admin header |
| `SCHOLARXIV_API_KEY` | Optional research API (server only) |

Names live in `.env.example` / `apps/server/.env.example`. Real values stay in the host secret store.

### Still open until a host exists

- Deploy frontend / backend
- Verify production analysis / voice flows on that host

## Deployment workflow (CI)

GitHub Actions CI (`.github/workflows/ci.yml`) runs install, migrations, typecheck, lint, tests, `smoke:local`, web/server builds, Playwright Chromium, and `smoke:browser` on every push and pull request.

**Configure deployment workflow:** not appropriate for v0.1 — there is no production host to deploy to. Do not add a deploy job that invents a URL.

**Block merges when checks fail:** see `docs/ops/branch-protection.md`. CI runs on PRs; requiring the check needs a repo admin. Do not claim branch protection is on until that rule exists.

## What judges should run

Follow the root `README.md`. Demo walkthrough: `docs/demo/script.md`. Backup path: `docs/demo/backup.md`. Checks: `npm run smoke:local` and `npm run smoke:browser`. Research evidence index: `docs/stark/research-evidence.md`.

## What is still open (honest)

- Deploy frontend / backend (P0) — blocked on a real host
- Production analysis and voice verification on that host
- Org admin enabling required status checks on `main`
- Live Voxide mic / Amharic STT
- Checked-in backup video / screenshot PNG pack
