-- Google OAuth subject. Password accounts may link the same email later.

alter table users
  add column if not exists google_sub text;

create unique index if not exists users_google_sub_unique
  on users (google_sub)
  where google_sub is not null;
