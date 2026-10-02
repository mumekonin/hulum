-- Point EthioScholarship at the catalog index so the worker starts from listing pages.

update sources
set url = 'https://scholarship.et/scholarships'
where name = 'EthioScholarship';
