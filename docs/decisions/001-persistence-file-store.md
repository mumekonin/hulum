# ADR 001 — Local JSON store before Supabase

**Status:** Accepted for v0.1 hackathon loop  
**Date:** 2026-09-18  
**Owners:** Mulualem (data), shared

## Context

The locked stack includes Supabase/Postgres + RLS. The team did not have production credentials on day one, and the vertical slice (profile → analyze → readiness) had to run locally.

## Decision

Persist v0.1 data in a gitignored JSON file (`STORE_PATH` / `data/store.json`). Keep `database/migrations/001_init.sql` as the cloud schema. Do not block Analyze on Supabase.

## Consequences

- Demo works with `npm run dev` and `.env.example`.
- No RLS at runtime until the API is wired to Postgres.
- Seed opportunities live in `apps/server/src/data/seedOpportunities.ts` and are reloaded from code, not from the JSON catalog.
- Switching to Supabase is a later Mulualem task; it must keep the same shared contracts.
