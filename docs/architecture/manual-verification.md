# Manual opportunity verification workflow

**Status:** process definition for the curated catalog  
**Date:** 2026-09-22  
**Code:** stored fields on `opportunities`; effective status in `apps/server/src/verification/rules.ts`

HULUM does not scrape live listings. Someone on the team curates rows and marks verification by hand.

## Steps

1. Open the **official** organization page (`sourceUrl`). Never invent a URL.
2. Confirm title, organization, deadline, country/education/field/language/document facts against that page.
3. Set `applicationUrl` only if the official apply link exists; otherwise leave null and use `sourceUrl` for apply authority.
4. Set `verificationStatus`:
   - `VERIFIED` when checked against the official source
   - `NEEDS_REVIEW` when unsure or partially checked
   - `EXPIRED` when the official deadline has passed (or let effective status derive expiry from the deadline date)
5. Set `lastVerifiedAt` to the check time (ISO timestamptz).
6. Re-check within **30 days** (`VERIFICATION_STALE_AFTER_DAYS`) or the API will present `VERIFIED` as `NEEDS_REVIEW` on read without rewriting the row.

## Demo catalog

Seed/demo opportunities in the repo follow the same fields. Judges should treat them as curated fixtures, not a live crawl.

## Out of scope for v0.1

- Admin UI for verification
- Automated link checkers
- Third-party “verified” badges from other platforms
