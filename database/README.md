# Database

HULUM v0.1 uses a local JSON store so the product loop runs without cloud credentials.

When Supabase is configured:

1. Copy `.env.example` to `.env` and set `DATABASE_URL` / Supabase keys.
2. Run `database/migrations/001_init.sql` in the Supabase SQL editor.
3. Seed opportunities from `apps/server/src/data/seedOpportunities.ts`.

RLS is defined for user-owned rows. Opportunity records are public read in the MVP.
