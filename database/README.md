# HULUM database

PostgreSQL / Supabase schema for v0.1. The running API still uses a local JSON file store (`STORE_PATH`) until the store switch is wired.

## Locked tables (Task 21)

| Table | Purpose |
|---|---|
| `users` | App user record (auth is P1; this is enough for profile persistence) |
| `profiles` | Structured applicant facts used by matching |
| `opportunities` | Curated official-source opportunities |
| `analyses` | Stored APPLY / MAYBE / SKIP result |
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

You can also paste `migrations/001_init.sql` into the Supabase SQL editor.

## Rules

- Do not invent opportunities, deadlines, or application links in seeds.
- `analyses.decision` is written by the deterministic engine only.
- Default opportunity `verification_status` is `NEEDS_REVIEW`.
- Do not claim the live API reads these tables yet.
