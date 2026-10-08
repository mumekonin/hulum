# Deployment guide (v0.1)

**Status:** hosts chosen, services not created yet. There is no public URL until Render and Vercel finish their first deploy.

This file is the Phase 26 **deployment guide** and the Phase 23 **deployment decision**.

## Decision

The API goes on **Render**. The website goes on **Vercel**. EthioDeploy is not the host.

Until those two services exist, HULUM still runs **locally** with:

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
| Auth | Email/password JWT (+ optional Google). Password reset sends mail when `SMTP_*` and `MAIL_FROM` are set. |

Optional: `GROQ_API_KEY` for explain / extract / screenshot vision / profile-document image text; `NEXT_PUBLIC_VOXIDE_KEY` (`vox_pub_…`) for the Ask HULUM widget. APPLY / MAYBE / SKIP still come from `decide()`. PDF uploads extract text without Groq.

## Render (API) and Vercel (web)

Commit and push `render.yaml` and `apps/web/vercel.json` before connecting the GitHub repo. Do not commit `apps/server/.env`.

### 1. Render — API

1. [Render](https://dashboard.render.com) → **New** → **Blueprint** → this repo. It reads `render.yaml` (`hulum-api`, Frankfurt, free).
2. Fill the values Render marks as missing. Copy them from `apps/server/.env`. Never paste them into git.

| Render variable | Value |
|---|---|
| `DATABASE_URL` | The same Postgres URL the API uses locally. Prefer the Supabase **session** string (port 5432). The transaction pooler (port 6543) can break migrations. |
| `SESSION_SECRET` | A long random string. Not the local demo value if that one was ever shared. |
| `CLIENT_URL` | The Vercel origin, no path. Example shape: `https://your-project.vercel.app`. Set this after step 2, then redeploy the API. |
| `API_PUBLIC_URL` | The Render origin, no path. Render shows it after the first deploy (`https://hulum-api.onrender.com` only if that name is free). |
| `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | The Gmail account that already sends reset mail locally. |
| `GROQ_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SCHOLARXIV_API_KEY` | Optional. Same names as local. |

3. The start command applies database migrations, then listens on `0.0.0.0` and Render's `PORT`. Health check: `/api/health`.
4. In Google Cloud, add the authorized redirect `{API_PUBLIC_URL}/api/auth/google/callback`.
5. Leave `INVESTIGATE_WORKER=false` on the free instance. It does not install Playwright's browser.

The free service sleeps when idle. The first request after sleep can take about a minute.

### 2. Vercel — website

1. [Vercel](https://vercel.com/new) → import the same GitHub repo.
2. **Root Directory:** `apps/web`. Framework: Next.js. `apps/web/vercel.json` installs and builds from the repo root so `@hulum/shared` is included.
3. Environment variable, set for Production before the build:

| Vercel variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | The Render origin, no path. |
| `NEXT_PUBLIC_VOXIDE_KEY` | Optional `vox_pub_…` key. Whitelist the Vercel origin in the Voxide dashboard. |

4. Deploy. Copy the site origin into Render `CLIENT_URL` and redeploy the API. The browser will be blocked by CORS until those two origins match.
5. Open the Vercel site, sign in, reset a password, and analyze one opportunity.

## Production configuration (ready; not hosted)

These Phase 23 rows mean **configuration exists in code/docs**, not that a public host is live.

### Configure database

1. Provision Postgres (local Docker or team Supabase).
2. Set `DATABASE_URL` in the server environment (never commit it).
3. Run `npm run db:migrate --workspace @hulum/server` (applies `001`–`013`: init, investigator, audit, RLS, worker, close seed, password hash, Google sub, profile documents, document text, saved opportunities, Afriwork / EthioScholarship sources).
4. Optional: `npm run db:smoke` (transactional insert/rollback).
5. Do **not** rely on `db:seed` for the live catalog — migration `006` closed curated seed inserts. The investigator fills opportunities from evidenced pages when Groq + worker env are set.

### Configure production secrets

Required before any public host:

| Secret / env | Purpose |
|---|---|
| `DATABASE_URL` | Postgres |
| `CLIENT_URL` | CORS origin (required in `NODE_ENV=production`) |
| `SESSION_SECRET` | JWT for `X-Hulum-Session` (required in production) |
| `API_PUBLIC_URL` | Public API origin for the Google callback. Required for Google sign-in on Render |
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

**Configure deployment workflow:** Render and Vercel deploy from GitHub when those projects exist. CI does not invent a URL and has no deploy job.

**Block merges when checks fail:** see `docs/ops/branch-protection.md`. CI runs on PRs; requiring the check needs a repo admin. Do not claim branch protection is on until that rule exists.

## What judges should run

Follow the root `README.md`. Demo walkthrough: `docs/demo/script.md`. Backup path: `docs/demo/backup.md`. Checks: `npm run smoke:local` and `npm run smoke:browser`. Research evidence index: `docs/stark/research-evidence.md`.

## What is still open (honest)

- Create the Render service and the Vercel project, then verify analysis, password reset, and voice on those URLs
- Org admin enabling required status checks on `main`
- Live Voxide mic / Amharic STT
- Checked-in backup video / screenshot PNG pack
