# Observability (v0.1)

HULUM tracks useful technical signals in-process. There is no Datadog/Sentry claim.

## What is recorded

| Signal | Source |
|---|---|
| API latency / HTTP error rates | `opsRequestTimingMiddleware` (route family only) |
| AI latency | Groq explain timing in `createAnalysisService` |
| AI validation failures | Unsafe explain text → stored-summary fallback (when recorded) |
| Decision-engine timing | `decide()` / analyze wrappers |
| Voice | File-store `/api/voice` requests via API middleware only (no STT metrics) |

Events keep **name, kind, ok, ms, optional code**. They do **not** store profile fields, utterance text, or secrets.

## Endpoints

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/ops/summary` | Rolling window aggregates + recent events |
| `POST` | `/api/ops/decision-debug` | `{ userId, opportunityId }` → `decide()` decision, fit, reasons (debug; not a user guarantee) |

## Out of scope (v0.1)

- Voice recognition failure rates (needs Voxide STT; text-fallback has none)
- Production metrics backend or dashboards
- Persisting ops events to Postgres
