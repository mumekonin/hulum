-- HULUM v1 schema (Build Spec §20).
-- Assignments Task 21 "requirements" is requirement_results:
-- those rows are analysis outcomes, not opportunity source facts.

create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_email_unique unique (email)
);

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  education_level text,
  field_of_study text,
  graduation_year integer,
  country text,
  city text,
  languages text[] not null default '{}',
  skills text[] not null default '{}',
  experience text,
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_user_id_unique unique (user_id),
  constraint profiles_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint profiles_graduation_year_check check (
    graduation_year is null
    or (graduation_year >= 1950 and graduation_year <= 2100)
  )
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  type text not null,
  description text not null,
  deadline date not null,
  country_eligibility text[] not null default '{}',
  education_requirements text[] not null default '{}',
  field_requirements text[] not null default '{}',
  experience_requirements text[] not null default '{}',
  language_requirements text[] not null default '{}',
  document_requirements text[] not null default '{}',
  other_requirements text[] not null default '{}',
  application_url text,
  source_url text not null,
  verification_status text not null default 'NEEDS_REVIEW',
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunities_type_check check (
    type in (
      'scholarship',
      'fellowship',
      'internship',
      'job',
      'grant',
      'competition'
    )
  ),
  constraint opportunities_verification_status_check check (
    verification_status in ('VERIFIED', 'NEEDS_REVIEW', 'EXPIRED')
  ),
  constraint opportunities_source_url_check check (char_length(source_url) > 0)
);

create table analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  opportunity_id uuid not null,
  decision text not null,
  fit_score integer not null,
  summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analyses_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint analyses_opportunity_id_fkey foreign key (opportunity_id) references opportunities (id) on delete restrict,
  constraint analyses_decision_check check (decision in ('APPLY', 'MAYBE', 'SKIP')),
  constraint analyses_fit_score_check check (fit_score >= 0 and fit_score <= 100)
);

comment on column analyses.decision is
  'Deterministic APPLY/MAYBE/SKIP. Claude must not change this stored value.';

create table requirement_results (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null,
  requirement_key text not null,
  requirement_text text not null,
  status text not null,
  evidence text,
  reason text,
  constraint requirement_results_analysis_id_fkey
    foreign key (analysis_id) references analyses (id) on delete cascade,
  constraint requirement_results_status_check check (
    status in ('MET', 'NOT_MET', 'UNCERTAIN', 'NOT_APPLICABLE')
  )
);

create table readiness_items (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null,
  title text not null,
  description text,
  status text not null default 'TODO',
  priority integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint readiness_items_analysis_id_fkey
    foreign key (analysis_id) references analyses (id) on delete cascade,
  constraint readiness_items_status_check check (
    status in ('TODO', 'IN_PROGRESS', 'DONE', 'NOT_REQUIRED')
  ),
  constraint readiness_items_priority_check check (priority >= 1)
);

create table voice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  language text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  constraint voice_sessions_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint voice_sessions_language_check check (language in ('am', 'en', 'om'))
);

create index opportunities_deadline_idx on opportunities (deadline);
create index opportunities_verification_status_idx on opportunities (verification_status);
create index analyses_user_id_idx on analyses (user_id);
create index analyses_opportunity_id_idx on analyses (opportunity_id);
create index requirement_results_analysis_id_idx on requirement_results (analysis_id);
create index readiness_items_analysis_id_idx on readiness_items (analysis_id);
create index voice_sessions_user_id_idx on voice_sessions (user_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on users
  for each row execute function set_updated_at();

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger opportunities_set_updated_at
  before update on opportunities
  for each row execute function set_updated_at();

create trigger analyses_set_updated_at
  before update on analyses
  for each row execute function set_updated_at();

create trigger readiness_items_set_updated_at
  before update on readiness_items
  for each row execute function set_updated_at();

alter table users enable row level security;
alter table profiles enable row level security;
alter table opportunities enable row level security;
alter table analyses enable row level security;
alter table requirement_results enable row level security;
alter table readiness_items enable row level security;
alter table voice_sessions enable row level security;

-- Public read of curated opportunities. Writes stay with the table owner / service role
-- until Task 35 adds auth.uid() policies. User tables have no public policies yet.
create policy opportunities_select_all
  on opportunities
  for select
  using (true);
