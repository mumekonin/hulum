# ScholarXIV log

**Status:** Website search is wired through HULUM’s API. Papers come only from a live ScholarXIV call; 12 logged below.  
**Date:** 2026-09-22 (paper table 2026-10-07)  
**Official docs:** https://scholarxiv.com/developers/docs/papers-api

## What is in the product

- Web: `/research`
- API: `GET /api/research/papers?q=`
- Server calls `GET https://scholarxiv.com/api/v1/papers/search` with `Authorization: Bearer` (`SCHOLARXIV_API_KEY`)
- The browser never receives the key
- Papers are research evidence. They are not opportunity listings. They do not set APPLY / MAYBE / SKIP

## Local setup

1. Create a key at https://scholarxiv.com/developers (keys start with `sxv_`).
2. Put `SCHOLARXIV_API_KEY=` in `apps/server/.env`. Do not commit it.
3. Restart `npm run dev:server`.
4. Open http://localhost:3000/research and search.

## Planned queries

1. Barriers to scholarship / opportunity application among Ethiopian or African university students.
2. Communicating eligibility uncertainty and responsible use of AI in high-stakes advice.
3. Voice-first or multilingual interfaces for non-English-dominant users.
4. Causes of incomplete or failed applications (documents, deadlines, eligibility mismatch).
5. Trust and verification of online opportunity postings.

## Paper table

Record a row only after a real `/research` (or Papers API) result. Do not invent citations.

Retrieved through HULUM's `GET /api/research/papers` (ScholarXIV, arXiv corpus). Findings are taken from each paper's abstract only.

| Query | Paper | Year | ID / URL | Finding used in HULUM | Date retrieved |
|---|---|---|---|---|---|
| low-resource African languages speech recognition | Automatic Speech Recognition for African Low-Resource Languages: Challenges and Future Directions (Imam et al.) | 2025 | https://arxiv.org/abs/2505.11690 | African languages are underrepresented in ASR; main barriers are data scarcity, linguistic complexity, acoustic variability. Supports text fallback beside voice. | 2026-10-07 |
| low-resource African languages speech recognition | ASR for African Low-Resource Languages: A Systematic Literature Review (Imam, Belay, Husse et al.) | 2025 | https://arxiv.org/abs/2510.01145 | 71 studies, 74 datasets, 111 languages, ~11,206 hours; under 15% reproducible. Do not assume a vendor's Amharic/Oromo STT quality without testing. | 2026-10-07 |
| low-resource African languages speech recognition | Benchmarking Automatic Speech Recognition Models for African Languages (Nahabwe et al.) | 2025 | https://arxiv.org/abs/2512.10968 | Whisper, XLS-R, MMS, W2v-BERT behave differently by data size across 13 African languages; model choice changes quality. | 2026-10-07 |
| low-resource African languages speech recognition | Multilingual self-supervised speech representations improve the speech recognition of low-resource African languages with codeswitching (Ogunremi, Manning, Jurafsky) | 2023 | https://arxiv.org/abs/2311.15077 | Speakers regularly code-switch with English; code-switched speech data is scarce. HULUM detects the asked language per request instead of fixing one. | 2026-10-07 |
| Amharic speech recognition | Semantically Corrected Amharic Automatic Speech Recognition (Adnew, Liang) | 2024 | https://arxiv.org/abs/2404.13362 | Existing Amharic ASR benchmarks ignore word spacing, inflating real-world accuracy. Matches the poor Amharic recognition seen in the 2026-10-07 mic pass. | 2026-10-07 |
| Afaan Oromo natural language processing | The effects of having lists of synonyms on the performance of Afaan Oromo Text Retrieval system (Kelbessa) | 2021 | https://arxiv.org/abs/2103.02900 | Afaan Oromo tooling is at small-prototype scale (158 documents, 13 queries). Supports keeping Oromo to text quick actions (ADR 004). | 2026-10-07 |
| multilingual conversational agent code-switching Africa | Are Multilingual Models Effective in Code-Switching? (Winata et al.) | 2021 | https://arxiv.org/abs/2103.13309 | Multilingual models do not guarantee good mixed-language understanding. Keep intents keyword-checked, not model-only. | 2026-10-07 |
| youth employment Africa job search | Skills and Liquidity Barriers to Youth Employment: Evidence from a Cash Benchmarking Experiment in Rwanda (McIntosh, Zeitlin) | 2022 | https://arxiv.org/abs/2209.08574 | Credit is a major barrier for underemployed young adults. Adjacent evidence only: cost barriers exist beyond eligibility. | 2026-10-07 |
| youth employment Africa job search | Empirical Review of Youth-Employment Policies in Nigeria (Omoju et al.) | 2023 | https://arxiv.org/abs/2310.07789 | Programs fail on coordination, funding, oversight, and not prioritizing marginalized groups. Adjacent: failure is often in the system, not the applicant. | 2026-10-07 |
| youth employment Africa job search | Empirical Review of Youth-Employment Programs in Ghana (Lambon-Quayefio et al.) | 2023 | https://arxiv.org/abs/2311.06048 | Duplicated, uncoordinated programs and few evaluations. Adjacent: fragmented information is a barrier. | 2026-10-07 |
| scholarship application students Africa | Access to Library Information Resources by University Students during COVID-19 in Africa: A Systematic Literature Review (Shikali, Muneja) | 2024 | https://arxiv.org/abs/2404.08682 | 23 studies on challenges students faced reaching information resources. Adjacent: access to information is uneven. | 2026-10-07 |
| university dropout Ethiopia | Why Do Students Drop Out? University Dropout Prediction and Associated Factor Analysis (Kim, Yoo, Kim) | 2023 | https://arxiv.org/abs/2310.10987 | Academic data was the strongest dropout predictor. Not African data; logged only as a method reference. | 2026-10-07 |

Gap: queries for scholarship or opportunity application barriers among Ethiopian or African students returned no direct study in this corpus (arXiv is mostly computing and economics). That question still needs education-journal sources or user interviews.

## Findings

Product rules still rest on the deterministic engine and official-source URLs. ScholarXIV now informs those rules from the Research page when a key is set.

## MCP

ScholarXIV MCP is documented at https://scholarxiv.com/developers/docs/mcp. This slice uses the Papers API in the website, not MCP inside Analyze.

**Exploration result:** MCP is optional tooling for research. HULUM does not run ScholarXIV MCP during Analyze or `decide()`. Phase 2 P1 “Explore ScholarXIV MCP” is closed by preferring the Papers API proxy already on `/research`.
