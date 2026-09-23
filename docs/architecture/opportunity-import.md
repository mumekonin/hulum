# Opportunity import workflow (v0.1)

**Status:** not required for v0.1  
**Date:** 2026-09-23

HULUM ships a **curated** opportunity catalog (seed / SQL), not a bulk importer.

| Approach | v0.1 |
|---|---|
| Manual seed / migration rows with official `sourceUrl` | **Used** |
| Admin CSV/JSON import UI | Not built |
| Live scrape / aggregator sync | Out of scope (trust failure) |

Teammates add listings by editing seed or SQL after confirming the official source URL and deadline. That is enough for the STARK demo.

If a later version needs import, it must still refuse invented URLs and keep `sourceUrl` as fact authority.
