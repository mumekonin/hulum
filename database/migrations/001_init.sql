-- HULUM v0.1 schema. Apply in Supabase/Postgres when DATABASE_URL is configured.
-- Until then the API uses a local JSON store with the same contracts.

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique,
  preferred_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  education_level text not null,
  field_of_study text not null,
  graduation_year integer,
  country text not null,
  city text,
  languages jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  experience text,
  years_experience numeric not null default 0,
  interests jsonb not null default '[]'::jsonb,
  documents_held jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null,
  type text not null,
  description text not null,
  deadline date not null,
  country_eligibility jsonb not null default '[]'::jsonb,
  education_requirements text,
  field_requirements text,
  experience_requirements text,
  language_requirements text,
  document_requirements jsonb not null default '[]'::jsonb,
  other_requirements jsonb not null default '[]'::jsonb,
  application_url text not null,
  source_url text not null,
  source_type text,
  verification_status text not null default 'NEEDS_REVIEW',
  last_verified_at timestamptz,
  requirements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  decision text not null,
  fit_score integer not null check (fit_score between 0 and 100),
  summary text not null,
  next_action text,
  explanation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists requirement_results (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses(id) on delete cascade,
  requirement_key text not null,
  requirement_text text not null,
  status text not null,
  evidence text,
  reason text
);

create table if not exists readiness_items (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'TODO',
  priority text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists voice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  language text not null default 'en',
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

alter table profiles enable row level security;
alter table analyses enable row level security;
alter table requirement_results enable row level security;
alter table readiness_items enable row level security;
alter table voice_sessions enable row level security;
