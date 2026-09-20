# HULUM architecture

Status: accepted for v0.1 (STARK 2026).  
Record: [ADR 001 — stack and providers](../decisions/001-stack-and-providers.md)

HULUM is a **decision-support** product. It is not an official eligibility authority.

```text
Kidist — web (Next.js, planned on main)
    │  buttons / text  +  Voxide widget (browser)
    │  fetch  /  registered tools
    ▼
Mulualem — API  http://localhost:3001/api
    │
    ├── decide() + requirement matcher   APPLY / MAYBE / SKIP
    ├── Groq                             explains a stored analysis only
    └── PostgreSQL (Supabase)            profiles, opportunities, analyses
```

## Runtime rules

| Concern | Owner | v0.1 fact |
|---|---|---|
| APPLY / MAYBE / SKIP | `apps/server/src/decision/decide.ts` | Deterministic. No model writes this. |
| Requirement MET / NOT_MET / UNCERTAIN | matcher | Never guess MET. |
| Plain-language “why” | Groq, then guards | Must match the stored decision. |
| Official deadline / eligibility | `sourceUrl` on the opportunity | HULUM analysis is secondary. |
| Voice | Voxide in the **browser** | Tools call the same APIs as buttons. |
| Research trail | ScholarXIV | Not a production opportunity API. |

Shared TypeScript types live in `packages/shared`. Web, mobile, and server must not copy them.

## What is on `main` today

- `apps/server` — Express 5, TypeScript, Vitest, `{ data, error }` envelope
- `packages/shared` — contracts
- `database/migrations` — PostgreSQL

`apps/web` is still Kidist’s work. The frontend choice is Next.js; it is not an excuse to put Groq or `decide()` in the browser.

## Local ports

| App | Port | CORS |
|---|---|---|
| Web | `3000` | Voxide dashboard whitelist |
| API | `3001` | `CLIENT_URL` (web origin, not the API origin) |
