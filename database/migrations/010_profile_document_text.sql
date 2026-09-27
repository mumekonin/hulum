-- Cache readable text from uploaded profile documents for decide() evidence.
-- Labels still drive DOCUMENTS MET; extracted text never silently rewrites profile fields.

alter table profile_documents
  add column if not exists extracted_text text,
  add column if not exists extracted_at timestamptz,
  add column if not exists extract_status text not null default 'pending';

alter table profile_documents
  drop constraint if exists profile_documents_extract_status_check;

alter table profile_documents
  add constraint profile_documents_extract_status_check check (
    extract_status in ('pending', 'ready', 'empty', 'failed')
  );
