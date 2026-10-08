-- Profile photo (one per user) and the original file name of uploaded documents.
-- The photo is display-only: it is never read by decide() and never matched against required documents.

alter table profile_documents
  add column if not exists file_name text;

alter table profile_documents
  drop constraint if exists profile_documents_file_name_check;

alter table profile_documents
  add constraint profile_documents_file_name_check check (
    file_name is null or (char_length(trim(file_name)) >= 1 and char_length(file_name) <= 200)
  );

create table if not exists profile_photos (
  user_id uuid primary key,
  mime_type text not null,
  bytes bytea not null,
  updated_at timestamptz not null default now(),
  constraint profile_photos_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint profile_photos_mime_check check (mime_type in ('image/jpeg', 'image/png', 'image/webp'))
);

grant select, insert, update, delete on profile_photos to hulum_app;

alter table profile_photos enable row level security;

drop policy if exists profile_photos_owner_all on profile_photos;
create policy profile_photos_owner_all
  on profile_photos
  for all
  using (user_id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on')
  with check (user_id = app_current_user_id() or current_setting('app.rls_bypass', true) = 'on');
