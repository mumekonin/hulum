# Task 48 — Adding a source

Do not commit API keys. Do not invent listings.

## Demo leads (already seeded)

- `https://scholarship.et/` — lead
- `https://www.scholars4dev.com/` — lead
- `https://opportunitydesk.org/` — lead
- `https://hetriil.moe.gov.et/` — official for pages it publishes

## Add another website

```sql
insert into sources (name, type, url, enabled, is_lead)
values ('New lead', 'WEB_PAGE', 'https://example.org/', true, true);
```

If that host may be saved as `sourceUrl`:

```sql
insert into official_domains (domain, note)
values ('example.org', 'Why this domain is official');
```

## Add another API later

1. Put the key and base URL in local `.env` (names in `.env.example`).
2. Insert a `sources` row with `type = 'API'`, `api_key_env`, and `api_url_env`.
3. Write a documented client. `JOB_OPPORTUNITIES_API_KEY` is reserved; the client is not called until `JOB_OPPORTUNITIES_API_URL` is a real documented URL.

## Curated catalog (web cards)

Investigator does not invent listings. To show official sourced cards locally:

```text
npm run db:seed
```

That loads `seedOpportunities` (already in the repo). It is not Groq output.

## Run

```text
npm run db:migrate
```

`POST /api/investigate` with header `x-hulum-investigate` matching `INVESTIGATE_ADMIN_SECRET`.

Groq extract uses a larger completion budget and `reasoning_effort=low` for `gpt-oss` models so reasoning tokens do not empty the reply. Official pages may follow a few same-domain listing links (for example HETRIIL internships). Aggregators stay leads. A page with no explicit deadline is saved as nothing.
