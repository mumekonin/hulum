# Voxide integration requirements (study)

**Status:** studied, not wired  
**Date:** 2026-09-21  
**Sources:** [voxide.app/docs](https://voxide.app/docs), [voxide.app](https://voxide.app/), ADR 001, ADR 003  
**Owners:** Kidist (widget UX), Mulualem (API contracts the widget calls)

This note closes Phase 12 **Study Voxide integration requirements**. It does **not** claim a live mic, Amharic STT, or a dashboard key in this repo.

## What Voxide is (as documented)

Voxide is a **browser** Voice AI SDK. It is not an Express STT/TTS client.

| Fact | Implication for HULUM |
|---|---|
| Tools run in the **browser** | Register capabilities that `fetch` existing HULUM APIs (`/api/voice/action`, analyze, readiness). Do not add a fake Voxide backend on `:3001`. |
| Gemini Live powers the agent | Gemini may route speech to capabilities. It **must not** invent APPLY / MAYBE / SKIP. The engine stays on the server (`decide()`). |
| React path: `@voxide/react` | Next.js (`apps/web`) can mount `VoxideWidget` after `VoxideClient` init. |
| Publishable key `vox_pub_…` | Safe in frontend **only** with Voxide Dashboard **domain whitelist** (CORS on the WebSocket). Whitelist `localhost:3000` for local, then the real web origin when deployed. |
| `VOXIDE_API_KEY` on the server | Leftover naming in `.env.example`. Not the integration path ADR 001 locks. |

## Minimum install path (when a key exists)

As of 2026-09-21 the repo includes:

1. `@voxide/react` in `apps/web`.
2. `NEXT_PUBLIC_VOXIDE_PUBLIC_KEY` (`vox_pub_…`) in `.env.example`.
3. `VoxidePanel` on `/assistant` — mounts only when the key is set; registers `runHulumRequest` → `POST /api/voice/action`.
4. Postgres Ask HULUM routes on `/api/voice/session` and `/api/voice/action` (text fallback works without Voxide).

Still required from the dashboard (not in this repo): a real publishable key and domain whitelist for `localhost:3000`. Without that key the UI stays text/quick-action only (ADR 003).

## Capabilities HULUM must expose

Map spoken requests to existing intents. Handlers should call `POST /api/voice/action` (or the thin web helpers that already do) so voice cannot become a second decision path.

| User intent (examples) | Existing product path |
|---|---|
| Should I apply? / Analyze this | `ANALYZE_OPPORTUNITY` → engine |
| Why? | Explain stored analysis |
| What am I missing? | `SHOW_MISSING_REQUIREMENTS` |
| What should I prepare? | Readiness checklist |
| Show APPLY / MAYBE / SKIP lists | `FILTER_BY_DECISION` |

Dangerous or irreversible actions (none in v0.1 apply flows) would need Voxide confirmation prompts if added later. Profile create/update by voice stays P1.

## Languages

Public Voxide marketing/docs describe the SDK and React widget. They **do not** publish a verified Amharic / Afaan Oromo STT/TTS matrix we can cite.

**Phase 13 “Verify Voxide supported languages” stays open** until a teammate with a live key measures English quality first, then Amharic. Until then ADR 004 stands: English text path is the e2e language; do not claim live Amharic voice.

## Explicitly out of scope for this study (and still open)

- Claiming microphone demo success without a live key
- Server-side Voxide proxy or inventing STT
- Letting the Gemini agent override `decide()`
- Verified Amharic / Afaan Oromo STT quality

## Next gated tasks

1. **Create development integration** — needs dashboard key + domain whitelist + widget mount.
2. **Receive/process voice input** / **Produce voice response** — come with the widget once wired.
3. **Verify supported languages** — live measurement after (1).
