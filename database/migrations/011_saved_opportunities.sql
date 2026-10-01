-- Opportunities a user bookmarked from Discover or the detail page. No decision is stored here;
-- APPLY/MAYBE/SKIP stays on analyses (decide.ts only).

create table if not exists saved_opportunities (
  user_id uuid not null,
  opportunity_id uuid not null,
  created_at timestamptz not null default now(),
  constraint saved_opportunities_pkey primary key (user_id, opportunity_id),
  constraint saved_opportunities_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint saved_opportunities_opportunity_id_fkey
    foreign key (opportunity_id) references opportunities (id) on delete cascade
);

create index if not exists saved_opportunities_opportunity_id_idx on saved_opportunities (opportunity_id);

alter table saved_opportunities enable row level security;

drop policy if exists saved_opportunities_owner_all on saved_opportunities;
create policy saved_opportunities_owner_all
  on saved_opportunities
  for all
  using (user_id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on')
  with check (user_id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on');
