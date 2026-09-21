# Opportunity catalog (v0.1)

v0.1 uses a **curated seed catalog** with official `sourceUrl` values (`apps/server/src/data/seedOpportunities.ts`).

An automated opportunity **import workflow is not required** for the STARK prototype:

- Judges and demos use the verified seed list.
- Manual verification steps live in `manual-verification.md`.
- Adding rows remains a curated edit + verify cycle, not a scrape/import pipeline.

If a later phase needs bulk import, it must still store and display the official source URL and must not invent eligibility text.
