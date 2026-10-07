-- CI / local smoke only: one static AI_EXTRACTED row so Discover → Analyze can run
-- when the investigator worker has not filled the catalog.
-- NOT a reopen of curated seed closed by 006. Live product catalog remains investigator-filled.
-- Copy shaped like apps/server/src/investigator/extract-afriwork.test.ts (public Afriwork URL).

insert into opportunities (
  id,
  title,
  organization,
  type,
  description,
  deadline,
  country_eligibility,
  education_requirements,
  field_requirements,
  experience_requirements,
  language_requirements,
  document_requirements,
  other_requirements,
  application_url,
  source_url,
  verification_status,
  investigated_at
) values (
  '00000000-0000-4000-8000-000000000015',
  'Software Development',
  'Private Client',
  'job',
  'Remote contractual role in Ethiopia (CI smoke fixture; AI_EXTRACTED shape only).',
  '2027-12-31',
  array['Ethiopia'],
  array['Applicants Needed: Both'],
  array['Software Development'],
  array['INTERMEDIATE Experience Level'],
  array['English'],
  array['CV'],
  array[]::text[],
  'https://afriworket.com/jobs/01e900b9-670d-41ff-968b-f041b2a1059c',
  'https://afriworket.com/jobs/01e900b9-670d-41ff-968b-f041b2a1059c',
  'AI_EXTRACTED',
  now()
)
on conflict (id) do nothing;
