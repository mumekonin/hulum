-- Background investigator: official domains already used as sourceUrl in the
-- curated catalog. Aggregators stay leads and are not inserted here.

insert into official_domains (domain, note) values
  ('a2sv.org', 'Africa to Silicon Valley official site.'),
  ('buildyourfuture.withgoogle.com', 'Generation Google Scholarship official page.'),
  ('alxafrica.com', 'ALX Africa official site.'),
  ('mastercardfdn.org', 'Mastercard Foundation Scholars Program official site.'),
  ('yalieastafrica.org', 'Yale Young African Scholars official site.'),
  ('chevening.org', 'Chevening official apply page host.'),
  ('rhodeshouse.ox.ac.uk', 'Rhodes Scholarship official apply host.'),
  ('schwarzmanscholars.org', 'Schwarzman Scholars official admissions host.'),
  ('careers.un.org', 'UN Careers internship programme host.'),
  ('tonyelumelufoundation.org', 'Tony Elumelu Foundation official programme host.'),
  ('daad.de', 'DAAD official scholarship finder host.'),
  ('mandelarhodes.org', 'Mandela Rhodes Scholarship official apply host.')
on conflict (domain) do nothing;

insert into sources (name, type, url, enabled, is_lead, api_key_env, api_url_env) values
  ('A2SV', 'WEB_PAGE', 'https://a2sv.org/', true, false, null, null),
  ('Generation Google Scholarship', 'WEB_PAGE', 'https://buildyourfuture.withgoogle.com/scholarships', true, false, null, null),
  ('ALX Africa', 'WEB_PAGE', 'https://www.alxafrica.com/', true, false, null, null),
  ('Mastercard Foundation Scholars', 'WEB_PAGE', 'https://mastercardfdn.org/en/what-we-do/our-programs/mastercard-foundation-scholars-program/', true, false, null, null),
  ('Yale Young African Scholars', 'WEB_PAGE', 'https://www.yalieastafrica.org/', true, false, null, null),
  ('Chevening', 'WEB_PAGE', 'https://www.chevening.org/apply/', true, false, null, null),
  ('Rhodes Scholarship', 'WEB_PAGE', 'https://www.rhodeshouse.ox.ac.uk/apply/application-overview/', true, false, null, null),
  ('Schwarzman Scholars', 'WEB_PAGE', 'https://www.schwarzmanscholars.org/admissions/', true, false, null, null),
  ('UN Internships', 'WEB_PAGE', 'https://careers.un.org/job-network/internship-programme?language=en', true, false, null, null),
  ('Tony Elumelu Foundation', 'WEB_PAGE', 'https://www.tonyelumelufoundation.org/entrepreneurship-programme', true, false, null, null),
  ('DAAD Scholarships', 'WEB_PAGE', 'https://www.daad.de/en/study-and-research-in-germany/scholarships/finding-scholarships/', true, false, null, null),
  ('Mandela Rhodes', 'WEB_PAGE', 'https://www.mandelarhodes.org/scholarship/apply/', true, false, null, null)
on conflict (name) do nothing;
