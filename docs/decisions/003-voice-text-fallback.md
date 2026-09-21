# ADR 003 — Text/quick-action voice until Voxide is real

**Status:** Accepted stopgap  
**Date:** 2026-09-18  
**Owners:** Kidist (UX), Mulualem (Voxide backend)

## Context

Voice is required and must execute HULUM actions. Voxide keys and STT/TTS were not available. A fake microphone that chats would violate `task.md` Phase 12.

## Decision

Ship `/assistant` and `POST /api/voice/action` as **the same intents** as the product (show/filter opportunities, explain, gaps, readiness) with typed text and quick actions. Report `text-fallback` when `VOXIDE_API_KEY` is missing.

## Consequences

- Demo cannot die if Voxide is down. Ask HULUM shows Voice unavailable and keeps text + quick actions.
- `ANALYZE_OPPORTUNITY` calls `runAnalysis` (same engine as the Analyze button).
- `FILTER_BY_DECISION` evaluates the catalog in memory and does not persist those analyses.
- Amharic keywords exist; live Amharic STT is not claimed.
- Wiring Voxide later should map audio → the same intent parser → the same services.
- Integration requirements for the browser widget are recorded in `docs/research/voxide-integration.md` (studied 2026-09-21; still not wired).
