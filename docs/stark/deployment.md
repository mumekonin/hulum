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

## Deployment workflow (CI)

GitHub Actions CI (`.github/workflows/ci.yml`) already runs install, migrations, typecheck, lint, tests, and web/server builds on every push and pull request.

**Configure deployment workflow:** not appropriate for v0.1 — there is no production host to deploy to. Do not add a deploy job that invents a URL.

**Block merges when checks fail:** CI runs on PRs, but requiring the check via GitHub branch protection needs org/repo admin. Until an admin enables **Settings → Branches → Require status checks → CI**, merges are not mechanically blocked. Do not claim branch protection is on.

## What judges should run

Follow the root `README.md`. Demo backup path: `docs/demo/backup.md` (text-only if voice fails).

## What is still open (honest)

- Deploy frontend / backend (P0) — blocked on a real host
- Production secrets on that host
- Production analysis and voice verification on that host
- Org admin enabling required status checks on `main`
