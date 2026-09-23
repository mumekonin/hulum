-- Task 48: pluggable investigation sources. Developers add a row to `sources`
-- or `official_domains`. Never store API keys here — only the env variable name.

alter table opportunities
  add column if not exists investigated_at timestamptz;

alter table opportunities
  drop constraint if exists opportunities_verification_status_check;

alter table opportunities
  add constraint opportunities_verification_status_check check (
    verification_status in ('VERIFIED', 'NEEDS_REVIEW', 'EXPIRED', 'AI_EXTRACTED')
  );

create table if not exists official_domains (
  domain text primary key,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  url text not null,
  enabled boolean not null default true,
  is_lead boolean not null default true,
  api_key_env text,
  api_url_env text,
  created_at timestamptz not null default now(),
  constraint sources_type_check check (type in ('WEB_PAGE', 'API', 'SEARCH')),
  constraint sources_name_unique unique (name)
);

create table if not exists investigation_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  checked integer not null default 0,
  saved integer not null default 0,
  rejected integer not null default 0,
  notes text
);

create table if not exists investigation_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references investigation_runs (id) on delete cascade,
  source_name text not null,
  action text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

insert into official_domains (domain, note) values
  ('hetriil.moe.gov.et', 'Ethiopia Ministry of Education HETRIIL. Official for pages it publishes.')
on conflict (domain) do nothing;

insert into sources (name, type, url, enabled, is_lead, api_key_env, api_url_env) values
  ('EthioScholarship', 'WEB_PAGE', 'https://scholarship.et/', true, true, null, null),
  ('Scholars4Dev', 'WEB_PAGE', 'https://www.scholars4dev.com/', true, true, null, null),
  ('OpportunityDesk', 'WEB_PAGE', 'https://opportunitydesk.org/', true, true, null, null),
  ('HETRIIL', 'WEB_PAGE', 'https://hetriil.moe.gov.et/', true, false, null, null),
  (
    'Job opportunities API',
    'API',
    'env:JOB_OPPORTUNITIES_API_URL',
    true,
    true,
    'JOB_OPPORTUNITIES_API_KEY',
    'JOB_OPPORTUNITIES_API_URL'
  )
on conflict (name) do nothing;
