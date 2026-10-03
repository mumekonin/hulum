# Opportunity import workflow (v0.1)

**Status:** investigator-filled catalog (curated seed closed)  
**Date:** 2026-10-02

HULUM does **not** ship a live catalog via `db:seed`. Migration `006_close_catalog_seed.sql` closed curated opportunity inserts. Listings come from the investigator worker (evidenced pages) and verification rules.

| Approach | v0.1 |
|---|---|
| Investigator fetch/extract + official `sourceUrl` | **Used** (when Groq / worker env set) |
| Manual SQL insert of a verified official page | Allowed for teammates — must not invent URLs |
| Admin CSV/JSON import UI | Not built |
| Bulk scrape inventing eligibility | Out of scope (trust failure) |

File-store `test-opportunities.ts` fixtures are for unit tests only. They are not loaded into Postgres.

If a later version adds import UI, it must still refuse invented URLs and keep `sourceUrl` as fact authority.
