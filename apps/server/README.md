# @hulum/server

Express + TypeScript API for HULUM.

## Run

From the repository root:

```bash
npm install
cp apps/server/.env.example apps/server/.env
npm run dev:server
```

Health check: `GET http://localhost:3001/api/health`

Analyze: `POST /api/opportunities/:id/analyze` with `{ "userId": "<uuid>" }`. Decision comes from `decide()`, not Claude. Analyze also stores a readiness checklist. `PATCH /api/readiness/:id` with `{ "status": "DONE" }` updates one item.

Optional keys in `.env` stay empty until later tasks. Never commit `.env`.

## Test

```bash
npm run typecheck:server
npm run test:server
```

Backend tests use **Vitest**. Keep using it for later server tests (matching, decision rules, validation).
