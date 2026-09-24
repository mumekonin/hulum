# Failure tests (Phase 20)

Honest coverage of remaining Phase 20 failure rows. Does not claim a production host or live microphone.

| Failure | How it is proven |
|---|---|
| Microphone unavailable | `@hulum/shared` failure messages + Ask HULUM `voice-unavailable` panel; `shared-failure-messages.node.test.ts` |
| Speech recognition failure | `recognitionFailureMessage` + Voxide `on("error")` → text/quick-action fallback; same unit test |
| Database failure | Postgres path maps connection errors to `503 DATABASE_UNAVAILABLE` (`isDatabaseFailure` / `error-handler.node.test.ts`) — no connection string in the body |
| Network interruption | Client `NETWORK` / `isNetworkFetchError` → user-facing copy (`shared-failure-messages.node.test.ts`) |
| Contradictory profile information | Conflicting years vs experience text stay `UNCERTAIN` (engine + `failures.test.ts` API path) |

Already covered earlier: Voxide/Claude timeout, malformed AI, missing profile, UNCERTAIN requirement, expired opportunity, unsupported voice request.
