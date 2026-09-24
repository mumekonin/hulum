-- Owner-scoped RLS policies for v0.1 (Task 35 / Phase 15 P1).
-- The API still connects as the table owner (owner bypasses RLS unless FORCE).
-- These policies apply to non-owner roles (e.g. a future hulum_app role).
-- Set request.user id with: select set_config('app.current_user_id', '<uuid>', true);

create or replace function app_current_user_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.current_user_id', true), '')::uuid
$$;

-- Drop previous public-only opportunity policy name if we recreate (idempotent).
drop policy if exists opportunities_select_all on opportunities;
create policy opportunities_select_all
  on opportunities
  for select
  using (true);

drop policy if exists opportunities_write_service on opportunities;
create policy opportunities_write_service
  on opportunities
  for all
  using (current_setting('app.rls_bypass', true) = 'on')
  with check (current_setting('app.rls_bypass', true) = 'on');

drop policy if exists users_owner_all on users;
create policy users_owner_all
  on users
  for all
  using (id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on')
  with check (id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on');

drop policy if exists profiles_owner_all on profiles;
create policy profiles_owner_all
  on profiles
  for all
  using (user_id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on')
  with check (user_id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on');

drop policy if exists analyses_owner_all on analyses;
create policy analyses_owner_all
  on analyses
  for all
  using (user_id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on')
  with check (user_id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on');

drop policy if exists requirement_results_owner_all on requirement_results;
create policy requirement_results_owner_all
  on requirement_results
  for all
  using (
    current_setting('app.rls_bypass', true) = 'on'
    or exists (
      select 1 from analyses a
      where a.id = requirement_results.analysis_id
        and a.user_id = app_current_user_id()
    )
  )
  with check (
    current_setting('app.rls_bypass', true) = 'on'
    or exists (
      select 1 from analyses a
      where a.id = requirement_results.analysis_id
        and a.user_id = app_current_user_id()
    )
  );

drop policy if exists readiness_items_owner_all on readiness_items;
create policy readiness_items_owner_all
  on readiness_items
  for all
  using (
    current_setting('app.rls_bypass', true) = 'on'
    or exists (
      select 1 from analyses a
      where a.id = readiness_items.analysis_id
        and a.user_id = app_current_user_id()
    )
  )
  with check (
    current_setting('app.rls_bypass', true) = 'on'
    or exists (
      select 1 from analyses a
      where a.id = readiness_items.analysis_id
        and a.user_id = app_current_user_id()
    )
  );

drop policy if exists voice_sessions_owner_all on voice_sessions;
create policy voice_sessions_owner_all
  on voice_sessions
  for all
  using (user_id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on')
  with check (user_id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on');
