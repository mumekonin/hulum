# ScholarXIV log

**Status:** Website search is wired through HULUM’s API. Papers still come only from a live ScholarXIV call.  
**Date:** 2026-09-22  
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

| Query | Paper | Year | ID / URL | Finding used in HULUM | Date retrieved |
|---|---|---|---|---|---|
| — | *None copied here yet* | — | — | Use the Research page for live results | — |

## Findings

Product rules still rest on the deterministic engine and official-source URLs. ScholarXIV now informs those rules from the Research page when a key is set.

## MCP

ScholarXIV MCP is documented at https://scholarxiv.com/developers/docs/mcp. This slice uses the Papers API in the website, not MCP inside Analyze.

**Exploration result:** MCP is optional tooling for research. HULUM does not run ScholarXIV MCP during Analyze or `decide()`. Phase 2 P1 “Explore ScholarXIV MCP” is closed by preferring the Papers API proxy already on `/research`.
