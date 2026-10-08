# ADR 001 — Local JSON store before Supabase

**Status:** Superseded for runtime (Postgres is the `npm run dev` default)  
**Date:** 2026-09-18 · **Updated:** 2026-10-02  
**Owners:** Mulualem (data), shared

## Context

The locked stack includes Supabase/Postgres + RLS. The team did not have production credentials on day one, and the vertical slice (profile → analyze → readiness) had to run locally.

## Decision (original)

Persist early v0.1 data in a gitignored JSON file (`STORE_PATH` / `data/store.json`). Keep `database/migrations/001_init.sql` as the cloud schema. Do not block Analyze on Supabase.

## Current runtime (2026-10-02)

- `npm run dev` boots Postgres via `createApp({ store: "postgres" })`.
- File-store (`createApp({ store: "file" })` + `decision/engine.ts`) remains for unit tests only.
- Catalog seed is closed. Live Postgres lists investigator rows only. File-store tests may use `test-opportunities.ts`.

## Consequences

- Local demo needs `DATABASE_URL` (and migrations).
- RLS policies exist for non-owner roles; the API still connects as table owner (owner bypasses RLS).
- Shared contracts stay the same across stores.
