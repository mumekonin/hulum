# Opportunity verification (v0.1)

HULUM does not invent listing facts. Curated seed rows carry `sourceUrl`, optional `applicationUrl`, `verificationStatus`, and `lastVerifiedAt`. The UI shows the effective status; the official organization page remains the eligibility authority.

Code: `apps/server/src/verification/rules.ts`. List/detail reads go through `presentOpportunity` in `apps/server/src/opportunities/service.ts`. `decide()` uses `effectiveVerificationStatus` so an expired listing cannot stay APPLY.

---

## Status values

| Stored / effective | Meaning |
|---|---|
| `VERIFIED` | A teammate checked the official source; `lastVerifiedAt` is set. |
| `NEEDS_REVIEW` | Not yet checked, blank `sourceUrl`, or a previously verified row that is stale on read. |
| `EXPIRED` | Stored as expired, or the deadline date is before today (UTC). |

`sourceUrl` is the fact authority for deadline and eligibility text. `applicationUrl` is only where to apply when present; otherwise apply falls back to `sourceUrl`. Empty `sourceUrl` is never invented — effective status becomes `NEEDS_REVIEW`.

---

## Manual verification workflow

v0.1 has **no admin console**. Verification is a teammate checklist when editing seed / catalog SQL or seed TypeScript.

1. Open the organization’s official opportunity page in a browser (the URL that will be stored as `sourceUrl`).
2. Confirm title, organization, type, deadline, country/education/field/language requirements against that page. Do not copy from secondary aggregators.
3. Set `applicationUrl` only if the organization publishes a separate apply link; otherwise leave it null.
4. Set `verificationStatus` to `VERIFIED` and `lastVerifiedAt` to the UTC time of that check.
5. If the page is gone, the deadline has passed on the official page, or requirements cannot be confirmed, set `EXPIRED` or leave / set `NEEDS_REVIEW` — never invent a replacement URL.
6. Commit the seed/migration change through the normal PR review. Do not put secrets in the catalog.

Re-verify when requirements or deadlines change on the official page, or when the listing ages past the stale window below.

---

## Stale-opportunity behavior

Freshness is **computed on read**. HULUM does not rewrite the database row when a listing goes stale.

| Rule | Behavior |
|---|---|
| Stale window | `VERIFICATION_STALE_AFTER_DAYS = 30` |
| Who is stale | Only rows currently stored as `VERIFIED` |
| Missing / invalid `lastVerifiedAt` | Treated as stale → effective `NEEDS_REVIEW` |
| Age &gt; 30 days | Effective `NEEDS_REVIEW`; stored status stays `VERIFIED` |
| Deadline before today (UTC) | Effective `EXPIRED` (wins over stale) |
| Stored `EXPIRED` | Stays `EXPIRED` |
| Empty `sourceUrl` | Effective `NEEDS_REVIEW` |

**Decision impact:** if effective status is `EXPIRED`, `decide()` returns **SKIP** and prepends a reason that HULUM is not the organization. Stale → `NEEDS_REVIEW` does **not** force SKIP by itself; matching and other rules still decide APPLY / MAYBE / SKIP. The list and detail screens show the effective status so users see “needs review” when the catalog is old.

Tests: `apps/server/src/verification/rules.test.ts`.

---

## Out of v0.1

- Admin UI to click “mark verified”
- Automatic scrape / re-fetch of official pages
- Push notifications when a listing goes stale
- Claiming HULUM confirmation as official eligibility
