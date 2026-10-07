-- Password reset for HULUM email/password accounts (users.password_hash, scrypt).
-- Only a SHA-256 hash of the emailed token is stored; the raw token never touches the database.

create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  constraint password_reset_tokens_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint password_reset_tokens_token_hash_unique unique (token_hash)
);

create index if not exists password_reset_tokens_user_id_idx on password_reset_tokens (user_id);

grant select, insert, update, delete on password_reset_tokens to hulum_app;

-- Tokens are read and consumed before a session exists, so only the auth service path (rls_bypass) may touch them.
alter table password_reset_tokens enable row level security;

drop policy if exists password_reset_tokens_service_only on password_reset_tokens;
create policy password_reset_tokens_service_only
  on password_reset_tokens
  for all
  using (current_setting('app.rls_bypass', true) = 'on')
  with check (current_setting('app.rls_bypass', true) = 'on');
