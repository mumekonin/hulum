# @hulum/server

Express + TypeScript API for HULUM.

## Run

From the repository root:

```bash
npm install
cp apps/server/.env.example apps/server/.env
# set DATABASE_URL and CLIENT_URL=http://localhost:3000
npm run db:migrate
npm run dev:server
```

Health check: `GET http://localhost:3001/api/health`

`npm run dev` / `dev:server` boots the **Postgres** path. APPLY / MAYBE / SKIP come from `decide()`, not Groq.

Analyze: `POST /api/opportunities/:id/analyze` with `{ "userId": "<uuid>" }`. Analyze also stores a readiness checklist. `PATCH /api/readiness/:id` with `{ "status": "DONE" }` updates one item. Explain: `POST /api/analyses/:id/explain` with optional `{ "language": "en" }`. Requires `GROQ_API_KEY` and `GROQ_MODEL`. Unsafe Groq text is replaced with the stored summary.

Optional keys in `.env` stay empty until later tasks. Never commit `.env`.

Production is https://hulum-api.onrender.com (`NODE_ENV=production`, `CLIENT_URL` = the Vercel origin). Groq keys stay optional. File-store (`createApp({ store: "file" })`) is for tests, not the default boot.

API surface, retention, and data-exposure notes: `docs/architecture/api.md`, `docs/architecture/retention.md`, `docs/architecture/data-exposure.md`. Deploy decision: `docs/stark/deployment.md`.

## Test

```bash
npm run typecheck:server
npm run test:server
```

Backend tests use **Vitest**. Keep using it for later server tests (matching, decision rules, validation).
