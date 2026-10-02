# Task 48 — Adding a source

Do not commit API keys. Do not invent listings.

## Demo leads (already seeded)

- `https://scholarship.et/scholarships` — lead (catalog + sitemap detail pages)
- `https://www.scholars4dev.com/` — lead
- `https://opportunitydesk.org/` — lead
- `https://afriworket.com/jobs` — lead (Ethiopia jobs board; Chromium renders Explore jobs, then `/jobs/{id}` pages)
- `https://hetriil.moe.gov.et/` — official for pages it publishes

## Add another website

```sql
insert into sources (name, type, url, enabled, is_lead)
values ('New lead', 'WEB_PAGE', 'https://example.org/', true, true);
```

Optional — remember a host as official after you verify it:

```sql
insert into official_domains (domain, note)
values ('example.org', 'Why this domain is official');
```

The worker also follows listing links and `sitemap.xml` off aggregator pages. It does not need every new host in `official_domains` first. Expired deadlines are not saved.

## Add another API later

1. Put the key and base URL in local `.env` (names in `.env.example`).
2. Insert a `sources` row with `type = 'API'`, `api_key_env`, and `api_url_env`.
3. Write a documented client. `JOB_OPPORTUNITIES_API_KEY` is reserved; the client is not called until `JOB_OPPORTUNITIES_API_URL` is a real documented URL.

## Catalog (web cards)

There is **no opportunity seed**. `npm run db:seed` does not insert listings.

The list is empty until the investigator worker saves evidenced posts. Abeba Tesfaye is a demo **profile**, not a catalog.

## Background worker

`npm run dev:server` / `npm run start` starts a worker after the API listens.

```text
Timer → runInvestigation() → save new official posts → refresh seen posts → mark stale AI_EXTRACTED
```

- Default interval: 30 minutes (`INVESTIGATE_INTERVAL_HOURS` or `INVESTIGATE_INTERVAL_MS`).
- First run starts immediately. Each run stops at **20 minutes** (parallel fetch + extract). Detail pages are extracted; index/nav/empty shells are not.
- Afriwork Explore jobs is opened in a browser when the static HTML has no job posts (installed Chrome first, then Playwright Chromium). The worker does not call Afriwork’s private API.
- Requires `GROQ_API_KEY` and `GROQ_MODEL`. Set `INVESTIGATE_WORKER=false` to disable.
- Overlapping runs are skipped. Failures are logged and do not stop the API.
- Aggregator listing pages are crawled and may be saved when the deadline and requirement sentences are on that page.
- `sourceUrl` is the official organization URL when it appears on the page; otherwise it is the listing page we fetched.
- Groq still cannot invent a deadline, requirement, or URL. Private/localhost fetch stays blocked.
- AI-extracted rows not seen again for 3 days become `NEEDS_REVIEW` (`INVESTIGATE_STALE_AFTER_MS`).
- Curated `VERIFIED` seed rows are not rewritten by stale marking.

Apply `005_investigator_worker.sql` with `npm run db:migrate` so official catalog hosts are in `official_domains` / `sources`.

## Manual run

```text
npm run db:migrate
```

`POST /api/investigate` with header `x-hulum-investigate` matching `INVESTIGATE_ADMIN_SECRET`.

Groq extract uses a larger completion budget and `reasoning_effort=low` for `gpt-oss` models so reasoning tokens do not empty the reply. Listing links on official and aggregator pages are followed. A page with no explicit deadline is saved as nothing. A URL that is not on the fetched page is rejected.
