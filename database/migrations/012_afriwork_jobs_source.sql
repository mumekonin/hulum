-- Afriwork Ethiopia jobs listing. Lead only: prefer an employer official URL when the page has one.

insert into sources (name, type, url, enabled, is_lead, api_key_env, api_url_env) values
  ('Afriwork jobs', 'WEB_PAGE', 'https://afriworket.com/jobs', true, true, null, null)
on conflict (name) do nothing;
