# HULUM database

PostgreSQL schema for v0.1. `npm run dev` defaults the API to Postgres (`createApp({ store: "postgres" })`). File-store mode remains for some unit tests only.

## Locked tables (Task 21)

| Table | Purpose |
|---|---|
| `users` | App user record (email/password hash and/or `google_sub`; JWT via `SESSION_SECRET`, required in production) |
| `profiles` | Structured applicant facts used by matching |
| `opportunities` | Investigator / verified official-source opportunities (curated seed closed) |
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

`GET /api/opportunities` reads this table. Catalog seed is closed (`006_close_catalog_seed.sql`). Do not insert invented postings. Use the investigator. Migration `015_ci_smoke_investigator_row.sql` adds one static **AI_EXTRACTED** row so CI/`smoke:browser` can Analyze when the worker has not run — not a curated-seed reopen.

Task 48 adds `sources`, `official_domains`, and investigation logs (`002_investigator.sql`). Add a new website later with `insert into sources (...)`. Add an official apply domain with `insert into official_domains (domain, note) values (...)`. Env names only in `.env.example`.

`POST /api/investigate` (header `x-hulum-investigate`) runs a fetch/extract pass. The same pass also runs on a timer when the API starts (`INVESTIGATE_WORKER`, default on if Groq is set). Saved rows are `AI_EXTRACTED` until a person marks `VERIFIED`. Aggregator listing pages may be stored as `sourceUrl` when that is the evidenced page; official org URLs are preferred when they appear on the page.

Migration `004_rls_owner_policies.sql` adds owner-scoped RLS policies (and public opportunity read). Migration `014_hulum_app_role.sql` creates `hulum_app`; API requests `SET LOCAL ROLE hulum_app` and set `app.current_user_id` (JWT) or `app.rls_bypass` (auth/investigator). Open local without `SESSION_SECRET` uses bypass. `npm run db:migrate` still connects as the `DATABASE_URL` owner.

Migration `011_saved_opportunities.sql` adds `saved_opportunities (user_id, opportunity_id, created_at)` with a composite primary key, cascade deletes, and an owner RLS policy. It holds bookmarks only; decisions stay on `analyses`. Agreed with Mulualem.

You can also paste `migrations/001_init.sql` into the Supabase SQL editor.

## Rules

- Do not invent opportunities, deadlines, or application links in seeds.
- `analyses.decision` is written by the deterministic engine only.
- Default opportunity `verification_status` is `NEEDS_REVIEW`.
- The Postgres path may return `EXPIRED` or `NEEDS_REVIEW` on read when the deadline has passed or verification is stale. That does not UPDATE the stored row.
