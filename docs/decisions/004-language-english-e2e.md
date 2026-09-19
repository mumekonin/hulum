# ADR 004 — English is the stable v0.1 language

**Status:** Accepted  
**Date:** 2026-09-19  
**Owners:** Kidist (UX), Mulualem (Voxide later)

## Context

Phase 13 requires one language end-to-end before adding more. Shared `LanguageCode` is already `en | am | om`. Voxide STT/TTS is not available. ADR 003 ships text/quick-action fallback.

## Decision

- UI and voice requests use the existing `preferredLanguage` / `language` field (`en`, `am`, `om`).
- Intent parsing stays keyword-based. It is not a translation layer.
- **English is the stable end-to-end language** for v0.1: session → intent → HULUM action → reply.
- Amharic keywords remain; do not claim live Amharic or Afaan Oromo voice until Voxide quality is verified.

## Consequences

- Changing language restarts the voice session with that code.
- Wiring Voxide later should pass the same `LanguageCode` into the same parser and actions.
