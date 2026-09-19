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

Optional keys in `.env` stay empty until later tasks. Never commit `.env`.

Production hosts must set `NODE_ENV=production`, `CLIENT_URL` (web origin for CORS), and `PORT` if not using 4000. Claude, Voxide, and Supabase keys stay optional; the file store is still the v0.1 default.

## Test

```bash
npm run typecheck:server
npm run test:server
```

Backend tests use **Vitest**. Keep using it for later server tests (matching, decision rules, validation).
