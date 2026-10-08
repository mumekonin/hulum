# Manual opportunity verification workflow

**Status:** process definition for investigator / verified catalog rows  
**Date:** 2026-10-02  
**Code:** stored fields on `opportunities`; effective status in `apps/server/src/verification/rules.ts`

HULUM does not invent listings. The investigator saves evidenced pages; teammates can also insert a verified official URL by SQL. Someone on the team marks verification by hand. Curated `db:seed` is closed.

## Steps

1. Open the **official** organization page (`sourceUrl`). Never invent a URL.
2. Confirm title, organization, deadline, country/education/field/language/document facts against that page.
3. Set `applicationUrl` only if the official apply link exists; otherwise leave null and use `sourceUrl` for apply authority.
4. Set `verificationStatus`:
   - `VERIFIED` when checked against the official source
   - `NEEDS_REVIEW` when unsure, partially checked, or still `AI_EXTRACTED`
   - `EXPIRED` when the official deadline has passed (or let effective status derive expiry from the deadline date)
5. Set `lastVerifiedAt` to the check time (ISO timestamptz).
6. Re-check within **30 days** (`VERIFICATION_STALE_AFTER_DAYS`) or the API will present `VERIFIED` as `NEEDS_REVIEW` on read without rewriting the row.

## Test fixtures

File-store opportunities in `apps/server/src/data/test-opportunities.ts` follow the same fields for unit tests. They are **not** loaded into Postgres. Judges should treat them as fixtures, not the live catalog.

## Out of scope for v0.1

- Admin UI for verification
- Automated link checkers
- Third-party "verified" badges from other platforms
