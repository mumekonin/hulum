# HULUM database

PostgreSQL schema for v0.1. `npm run dev` defaults the API to Postgres (`createApp({ store: "postgres" })`). File-store mode remains for some unit tests only.

## Locked tables (Task 21)

| Table | Purpose |
|---|---|
| `users` | App user record (HMAC session auth is optional locally; required in production via `SESSION_SECRET`) |
| `profiles` | Structured applicant facts used by matching |
| `opportunities` | Curated official-source opportunities |
| `analyses` | Stored APPLY / MAYBE / SKIP result (+ optional `decision_audit` jsonb from migration 003) |
| `requirement_results` | Per-requirement status for one analysis |
| `readiness_items` | Checklist produced from an analysis |
| `voice_sessions` | Session metadata only — no audio or transcript |

Assignments Task 21 called the analysis table `requirements`. The locked name is `requirement_results` so it is not confused with opportunity source requirements (those stay on `opportunities`).

Tell Kidist before changing any of these names or columns.

## Apply

Put `DATABASE_URL` in local `apps/server/.env`. Never commit it.

```bash
npm run db:migrate
npm run db:smoke
```

`db:smoke` inserts sample rows in a transaction and rolls them back. It does not seed the catalog.

`GET /api/opportunities` reads this table. Do not insert invented postings.

Task 48 adds `sources`, `official_domains`, and investigation logs (`002_investigator.sql`). Add a new website later with `insert into sources (...)`. Add an official apply domain with `insert into official_domains (domain, note) values (...)`. Env names only in `.env.example`.

`POST /api/investigate` (header `x-hulum-investigate`) runs a fetch/extract pass. Saved rows are `AI_EXTRACTED` until a person marks `VERIFIED`.

Migration `004_rls_owner_policies.sql` adds owner-scoped RLS policies (and public opportunity read). The API still connects as the table owner (owner bypasses RLS unless `FORCE`). Use a non-owner role + `app.current_user_id` / `app.rls_bypass` when hardening further.

You can also paste `migrations/001_init.sql` into the Supabase SQL editor.

## Rules

- Do not invent opportunities, deadlines, or application links in seeds.
- `analyses.decision` is written by the deterministic engine only.
- Default opportunity `verification_status` is `NEEDS_REVIEW`.
- The Postgres path may return `EXPIRED` or `NEEDS_REVIEW` on read when the deadline has passed or verification is stale. That does not UPDATE the stored row.
