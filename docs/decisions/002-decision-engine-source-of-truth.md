# ADR 002 — Deterministic engine is the source of truth

**Status:** Accepted  
**Date:** 2026-09-18  
**Owners:** Mulualem (engine), Kidist (must not hide this in UI)

## Context

Claude can write fluent eligibility language. That is also how products invent deadlines and override “maybe.”

## Decision

1. `matchRequirement` + `decide` in `apps/server` own APPLY / MAYBE / SKIP.  
2. Fit score is a weighted signal, never a replacement for the rules.  
3. Groq, when `GROQ_API_KEY` is set, receives the structured analysis and may only rephrase. On failure, show the engine summary.  
4. Opportunity requirements and official URLs come from the investigator-filled catalog (or fixtures), not from the model.

## Consequences

- Tests in `engine.test.ts` lock APPLY / MAYBE / SKIP / deadline SKIP.  
- UI must show requirement statuses, not only a chat paragraph.  
- Adding Voxide later still calls this engine; voice cannot become a second decision path.
