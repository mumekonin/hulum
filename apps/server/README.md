# @hulum/server

Express + TypeScript API for HULUM.

## Run

From the repository root:

```bash
npm install
cp apps/server/.env.example apps/server/.env
npm run dev:server
```

Health check: `GET http://localhost:4000/api/health`

Analyze: `POST /api/opportunities/:id/analyze` with `{ "userId": "<uuid>" }`. Decision comes from `decide()`, not Groq. Analyze also stores a readiness checklist. `PATCH /api/readiness/:id` with `{ "status": "DONE" }` updates one item. Explain: `POST /api/analyses/:id/explain` with optional `{ "language": "en" }`. Requires `GROQ_API_KEY` and `GROQ_MODEL`. Unsafe Groq text is replaced with the stored summary.

Optional keys in `.env` stay empty until later tasks. Never commit `.env`.

Production hosts must set `NODE_ENV=production`, `CLIENT_URL` (web origin for CORS), and `PORT` if not using 4000. Claude, Voxide, and Supabase keys stay optional; the file store is still the v0.1 default.

## Test

```bash
npm run typecheck:server
npm run test:server
```

Backend tests use **Vitest**. Keep using it for later server tests (matching, decision rules, validation).
