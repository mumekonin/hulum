-- Real email/password auth. Hash only — never store the plaintext password.

alter table users
  add column if not exists password_hash text;
