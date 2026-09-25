-- Photos (or a PDF) of documents the user already holds. Labels feed documentsHeld matching.

create table if not exists profile_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  label text not null,
  mime_type text not null,
  bytes bytea not null,
  created_at timestamptz not null default now(),
  constraint profile_documents_user_id_fkey foreign key (user_id) references users (id) on delete cascade,
  constraint profile_documents_label_check check (
    char_length(trim(label)) >= 1 and char_length(label) <= 80
  ),
  constraint profile_documents_mime_check check (
    mime_type in ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')
  )
);

create index if not exists profile_documents_user_id_idx on profile_documents (user_id);
