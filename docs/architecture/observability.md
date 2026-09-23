# Observability (v0.1)

HULUM tracks useful technical signals in-process. There is no Datadog/Sentry claim.

## What is recorded

| Signal | Source |
|---|---|
| API latency / HTTP error rates | `opsRequestTimingMiddleware` (route family only) |
| AI latency | Groq explain timing in `createAnalysisService` |
| AI validation failures | Unsafe explain text → stored-summary fallback (when recorded) |
| Decision-engine timing | `decide()` / analyze wrappers |
| Voice action latency | `timeOps("voice", …)` on `POST /api/voice/action` |
| Voice session start | `timeOps("session", …)` on `POST /api/voice/session` |
| Voice recognition / silence / session errors | Browser `POST /api/ops/client-event` (whitelist codes only; no transcripts) |

Events keep **name, kind, ok, ms, optional code**. They do **not** store profile fields, utterance text, or secrets.

## Endpoints

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/ops/summary` | Rolling window aggregates + recent events |
| `POST` | `/api/ops/decision-debug` | `{ userId, opportunityId }` → `decide()` decision, fit, reasons (debug; not a user guarantee) |
| `POST` | `/api/ops/client-event` | `{ code, kind?, name? }` — allowed codes: `VOICE_RECOGNITION_FAILED`, `VOICE_SESSION_ERROR`, `VOICE_SILENCE_TIMEOUT` |

## Out of scope (v0.1)

- Production metrics backend or dashboards
- Persisting ops events to Postgres
- Sending raw recognition transcripts or profile text into ops
