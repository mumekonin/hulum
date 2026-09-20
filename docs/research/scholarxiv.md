# ScholarXIV log

**Status:** Space created. **No papers have been retrieved yet.**  
**Date:** 2026-09-18

## Planned queries

Use these with ScholarXIV Papers API / MCP when that integration is actually run. Copy results here with title, year, identifier, and a short note. Do not paste invented citations.

1. Barriers to scholarship / opportunity application among Ethiopian or African university students.
2. Communicating eligibility uncertainty and responsible use of AI in high-stakes advice.
3. Voice-first or multilingual interfaces for non-English-dominant users.
4. Causes of incomplete or failed applications (documents, deadlines, eligibility mismatch).
5. Trust and verification of online opportunity postings.

## Paper table

| Query | Paper | Year | ID / URL | Finding used in HULUM | Date retrieved |
|---|---|---|---|---|---|
| — | *None yet* | — | — | — | — |

## Findings

None from ScholarXIV so far. Product rules currently rest on:

- Engineering decisions (deterministic engine, official-source URLs, text fallback for voice).
- Labeled hypotheses in `docs/product/research-questions.md`.

## ScholarXIV MCP / Papers API

`HULUM_Documentation.md` places ScholarXIV **outside the runtime request path**. It informs design; it does not run during Analyze.

v0.1 has not yet configured ScholarXIV MCP or called the Papers API from this repository. That is Phase 2 P1 and remains open.

When someone runs a real search, add a row to the table above in the same commit as the notes. Empty rows are more honest than fake papers.
