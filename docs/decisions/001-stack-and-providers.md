# ADR 001 — Stack and providers (v0.1)

- **Status:** Accepted
- **Date:** 2026-09-20
- **Task:** 42
- **Recorded by:** Mulualem (team locks agreed with Kidist where noted)

## Context

Team HULUM is two people on a 20-day STARK hackathon. The original concept named Next.js, React Native, Express/TypeScript, Supabase/PostgreSQL, Claude, Voxide, ScholarXIV, and EthioDeploy.

We need one place that says which of those we actually use, what we rejected, and which old lines in the SRS are wrong.

## Decision

### Product shape

HULUM evaluates a profile against a curated opportunity and returns APPLY, MAYBE, or SKIP, then why, what’s missing, readiness, and the official source.

The organization still owns eligibility and deadlines. See `OFFICIAL_SOURCE_NOTICE` in `@hulum/shared`.

### Frontend — Next.js / TypeScript / Tailwind

Kidist builds `apps/web`. Next.js matches the concept, STARK web demos, and one TypeScript language with the API.

**Not chosen:** a separate marketing site, a Python UI, or putting decision logic in React.

**React Native (Assignments Task 14):** the Build Spec keeps native apps out of v0.1. Web is the demo surface. Do not start Task 14 unless both teammates explicitly agree.

### Backend — Node.js, Express 5, TypeScript

Mulualem builds `apps/server`. Same language as the web app. Strict TypeScript. Routes stay thin. `{ data, error }` from `@hulum/shared`.

**Not chosen:** Next.js Route Handlers as the only API (decision engine and Groq stay off the client). **Not chosen:** FastAPI (second language on a two-person team).

### Contracts — `packages/shared`

One package for enums, API envelope, Profile, Opportunity, Analysis, voice intents. Changing it needs both teammates.

### Data — PostgreSQL on Supabase

Opportunities, profiles, analyses, requirement results, readiness, and voice **session metadata** (no audio, no transcript). Access today is `DATABASE_URL` + `pg`. RLS remains a later hardening item. Auth is P1; Task 35 did not add JWT.

**Not chosen:** a JSON file store (not durable, not the spec). **Not chosen:** inventing opportunities at runtime.

### Decision engine — deterministic TypeScript

`decide()` plus the matcher are the only source of APPLY / MAYBE / SKIP. Same profile + opportunity + clock date → same result. Fit-score weights are named constants and sum to 100. Ambiguous facts are UNCERTAIN, never guessed MET. Expired listings are never APPLY.

**Not chosen:** “let the LLM decide.” The SRS said Claude could set the decision. That is **wrong**.

### Explanation — Groq, not Claude, not Grok

The spec named **Claude** as the explainer. Cost forced a team lock:

| Option | Outcome |
|---|---|
| Anthropic Claude | Concept default. Not used in v0.1 because of cost. |
| xAI Grok | Rejected (cost / access). |
| Cursor API + Grok | Rejected (cost). |
| **Groq** OpenAI-compatible chat | **Locked.** Env: `GROQ_API_KEY`, `GROQ_MODEL` (example: `openai/gpt-oss-20b`). |

Groq may only explain a **stored** analysis. Guards replace empty, JSON, invented URLs, or a contradictory APPLY/MAYBE/SKIP word with the stored summary + next action.

`CLAUDE_API_KEY` may still appear in `.env.example` as a leftover name. v0.1 explain does not call Anthropic.

### Voice — Voxide in the browser

Official Voxide ([voxide.app/docs](https://voxide.app/docs)) is a **client widget** (`@voxide/react`, publishable `vox_pub_…`, domain whitelist). It runs tools in the browser. Those tools `fetch` existing HULUM APIs.

**Not chosen:** an Express STT/TTS client. The old line “Voxide keys stay server-side” assumed a server voice API. That is not this product. Do not implement Task 32 as a fake Voxide backend.

Gemini-in-Voxide must not set APPLY/MAYBE/SKIP.

If voice fails, buttons and text still call the same APIs.

`VOXIDE_API_KEY` in server env is leftover naming. The widget uses the **public** key on the web origin (`localhost:3000`), not API `3001`.

### Research — ScholarXIV

ScholarXIV documents ideation (Task 40). It is **not** a third production API key and not a source of live scholarships.

### Deploy — EthioDeploy (later)

Concept names EthioDeploy. Task 37 investigates it. This ADR does not invent a deploy API. Until then: local API on port 3001, `CLIENT_URL` for CORS.

## Consequences

- Judges can be told: engine decides, Groq explains, Voxide talks, official URL wins.
- Kidist wires Voxide tools to current endpoints; Mulualem does not add a voice provider client.
- README and this ADR must agree. If they drift, this ADR plus `task.md` win over the older SRS (`HULUM_Documentation.md`).
- Native mobile, full auth, Claude, and crawlers stay out unless the team re-opens the decision in writing.
