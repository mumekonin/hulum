# Voxide supported languages (verification)

**Status:** verified from public docs only — **no live mic claim**  
**Date:** 2026-09-23  
**Task:** Phase 13 P0 — Verify Voxide supported languages  
**Sources:** [voxide.app](https://voxide.app/), [voxide.app/docs](https://voxide.app/docs), ADR 001, ADR 004  
**Owners:** Kidist (UX / language selector), Mulualem (API language codes)

## What we checked

Public Voxide documentation (Introduction / install / React widget) describes:

- Browser `@voxide/react` client + widget
- Gemini Live–powered agent
- Publishable `vox_pub_…` keys and domain whitelist

It does **not** publish a language matrix (no table listing English, Amharic, Afaan Oromo, or locale codes).

A web search of Voxide marketing and docs on 2026-09-23 likewise returned **no** Amharic or Afaan Oromo support claim from Voxide itself.

## What that means for HULUM

| Language | In product today | Live Voxide STT/TTS claimed? |
|---|---|---|
| English (`en`) | Stable UI + intent keywords + text/quick actions (ADR 004) | Not claimed without a keyed mic test |
| Amharic (`am`) | `LanguageCode` + some intent keywords; selector stores preference | **No** — not listed in Voxide public docs; not mic-tested |
| Afaan Oromo (`om`) | `LanguageCode` + selector only | **No** |

HULUM must not invent a Voxide language list. Third-party ASR projects (for example Ethio-ASR) or Azure Speech Amharic locales are **not** Voxide.

## Decision for v0.1

1. **English remains the only stable end-to-end language** (ADR 004).
2. Keep `en` / `am` / `om` in shared contracts and the Ask HULUM selector so wiring later does not need a schema change.
3. Leave Phase 13 P1s (**Add second language**, **Add third language if stable**, mixed-language tests) **open** until a real `vox_pub_…` key + mic test shows usable Amharic (or Oromo) recognition for HULUM intents.
4. Do **not** mark MVP “Amharic support if Voxide quality is sufficient” DONE from this note alone.

## Re-check when a key exists

With dashboard key + `localhost:3000` whitelist:

1. Speak English intents on `/assistant` with the widget.
2. Repeat the same intents in Amharic; record pass/fail for intent → `decide()` path.
3. Update this file with date, who tested, and results. Still no fake screenshots.

## Related

- `docs/decisions/004-language-english-e2e.md`
- Open onto-main: Voxide study / widget / dev-integration (browser widget path, ADR 001)
