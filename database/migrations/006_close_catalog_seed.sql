-- Catalog seed is closed. Remove curated VERIFIED rows that came from
-- seedOpportunities.ts. Investigator AI_EXTRACTED rows are kept.

delete from analyses
where opportunity_id in (
  select id from opportunities
  where verification_status = 'VERIFIED'
    and source_url in (
      'https://a2sv.org/',
      'https://buildyourfuture.withgoogle.com/scholarships',
      'https://www.alxafrica.com/',
      'https://mastercardfdn.org/en/what-we-do/our-programs/mastercard-foundation-scholars-program/',
      'https://www.yalieastafrica.org/',
      'https://www.chevening.org/apply/',
      'https://www.rhodeshouse.ox.ac.uk/apply/application-overview/',
      'https://www.schwarzmanscholars.org/admissions/',
      'https://careers.un.org/job-network/internship-programme?language=en',
      'https://www.tonyelumelufoundation.org/entrepreneurship-programme',
      'https://www.daad.de/en/study-and-research-in-germany/scholarships/finding-scholarships/',
      'https://www.mandelarhodes.org/scholarship/apply/'
    )
);

delete from opportunities
where verification_status = 'VERIFIED'
  and source_url in (
    'https://a2sv.org/',
    'https://buildyourfuture.withgoogle.com/scholarships',
    'https://www.alxafrica.com/',
    'https://mastercardfdn.org/en/what-we-do/our-programs/mastercard-foundation-scholars-program/',
    'https://www.yalieastafrica.org/',
    'https://www.chevening.org/apply/',
    'https://www.rhodeshouse.ox.ac.uk/apply/application-overview/',
    'https://www.schwarzmanscholars.org/admissions/',
    'https://careers.un.org/job-network/internship-programme?language=en',
    'https://www.tonyelumelufoundation.org/entrepreneurship-programme',
    'https://www.daad.de/en/study-and-research-in-germany/scholarships/finding-scholarships/',
    'https://www.mandelarhodes.org/scholarship/apply/'
  );
