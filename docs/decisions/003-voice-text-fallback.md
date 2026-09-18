# ADR 003 — Text/quick-action voice until Voxide is real

**Status:** Accepted stopgap  
**Date:** 2026-09-18  
**Owners:** Kidist (UX), Mulualem (Voxide backend)

## Context

Voice is required and must execute HULUM actions. Voxide keys and STT/TTS were not available. A fake microphone that chats would violate `task.md` Phase 12.

## Decision

Ship `/assistant` and `POST /api/voice/action` as **the same intents** as the product (show/filter opportunities, explain, gaps, readiness) with typed text and quick actions. Report `text-fallback` when `VOXIDE_API_KEY` is missing.

## Consequences

- Demo cannot die if Voxide is down.  
- `ANALYZE_OPPORTUNITY` still needs to call the decision engine instead of only telling the user to click Analyze (open follow-up, Mulualem Task 33).  
- Amharic keywords exist; live Amharic STT is not claimed.  
- Wiring Voxide later should map audio → the same intent parser → the same services.
