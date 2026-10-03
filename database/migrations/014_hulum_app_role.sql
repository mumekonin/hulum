-- Runtime non-owner role so RLS in 004/011 actually applies (Task 35 / Phase 15).
-- API request paths SET LOCAL ROLE hulum_app; auth/investigator also set app.rls_bypass.
-- Migrate/smoke may still connect as table owner without SET ROLE.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'hulum_app') then
    create role hulum_app nologin noinherit;
  end if;
end
$$;

grant usage on schema public to hulum_app;
grant select, insert, update, delete on all tables in schema public to hulum_app;
grant usage, select on all sequences in schema public to hulum_app;
alter default privileges in schema public
  grant select, insert, update, delete on tables to hulum_app;
alter default privileges in schema public
  grant usage, select on sequences to hulum_app;

-- Allow the migrator / DATABASE_URL role to SET ROLE hulum_app.
-- Do not GRANT to reserved roles (e.g. supabase_admin) — that fails on managed Postgres.
do $$
begin
  execute format('grant hulum_app to %I', session_user);
  if exists (select 1 from pg_roles where rolname = 'postgres')
     and session_user is distinct from 'postgres' then
    begin
      execute 'grant hulum_app to postgres';
    exception
      when insufficient_privilege then
        null;
      when undefined_object then
        null;
    end;
  end if;
end
$$;

-- profile_documents was added after 004; give it the same owner policy.
alter table profile_documents enable row level security;

drop policy if exists profile_documents_owner_all on profile_documents;
create policy profile_documents_owner_all
  on profile_documents
  for all
  using (user_id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on')
  with check (user_id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on');
