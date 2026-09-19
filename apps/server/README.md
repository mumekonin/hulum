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

Optional keys in `.env` stay empty until later tasks. Never commit `.env`.

## Test

```bash
npm run typecheck:server
npm run test:server
```

Backend tests use **Vitest**. Keep using it for later server tests (matching, decision rules, validation).
