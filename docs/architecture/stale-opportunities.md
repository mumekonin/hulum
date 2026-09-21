# Stale and expired opportunities

**Status:** implemented in the API presentation layer  
**Code:** `apps/server/src/verification/rules.ts`  
**Date:** 2026-09-21

HULUM does not rewrite catalog rows on every read. Effective status is computed when listing or fetching an opportunity (`presentOpportunity`).

| Rule | Effective status |
|---|---|
| Stored `EXPIRED`, or deadline date before today (UTC) | `EXPIRED` |
| Stored `VERIFIED` with no `lastVerifiedAt`, unparseable date, future `lastVerifiedAt`, or age &gt; **30 days** | `NEEDS_REVIEW` |
| Empty `sourceUrl` | `NEEDS_REVIEW` |
| Otherwise | stored status |

`decide()` treats effective `EXPIRED` as never APPLY (SKIP). Official eligibility still comes from `sourceUrl`; HULUM is not the organization.

Manual re-verification of catalog rows (who edits `lastVerifiedAt`) remains a separate P1 workflow.
