# HULUM architecture (v0.1 as built)

**Owner:** shared (Mulualem runtime, Kidist web)  
**Reviewed:** 2026-09-19  
**Code:** `apps/web`, `apps/server`, `packages/shared`

This describes the running repository, not a future cloud diagram. Judges: `docs/stark/evidence.md`.

```text
Browser (Next.js :3000)
        ↓  REST  { data, error }
Express API (:4000)
        ├── security headers + CORS (CLIENT_URL required in production)
        ├── packages/shared contracts
        ├── decision/  (source of truth for APPLY/MAYBE/SKIP)
        ├── file JSON store  (default)
        ├── Claude explain()  optional, JSON-validated
        └── Voxide            not wired; text intents + backup UI
```

ScholarXIV is **not** on this path. See `docs/research/`.

---

## Packages

| Path | Role |
|---|---|
| `apps/web` | Next.js App Router: `/`, `/profile`, `/opportunities`, `/analysis/[id]`, `/assistant` |
| `apps/server` | Express routes, matching, decision, readiness, optional Claude wording, voice-text |
| `packages/shared` | Profile, Opportunity, Decision, RequirementStatus, Analysis, ReadinessItem, VoiceIntent, Zod schemas |
| `database/migrations/001_init.sql` | Postgres/Supabase schema for when credentials exist |
| `data/store.json` | Local persistence (gitignored) |

Frontend never receives Claude or Voxide keys. `NEXT_PUBLIC_API_URL` is the only public env.

---

## Analyze path

```text
Profile + Opportunity
        ↓
matchRequirement  →  MET | NOT_MET | UNCERTAIN | NOT_APPLICABLE
        ↓
scoreRequirements  →  0–100 (signal only)
        ↓
decide  →  APPLY | MAYBE | SKIP
        ↓
readiness items
        ↓
optional Claude sentence  (must not change decision)
        ↓
persist analysis
        ↓
UI / voice-text reply
```

The Analyze button and `ANALYZE_OPPORTUNITY` both call `runAnalysis`.

Rules (also in `apps/server/src/decision/engine.ts` and tests):

1. Critical `NOT_MET` → SKIP  
2. Key requirements (country, education, field) all MET, no significant uncertainty, fit ≥ 75 → APPLY  
3. Else → MAYBE  

---

## APIs in use

```http
GET    /api/health
POST   /api/profile
POST   /api/profile/demo
GET    /api/profile/:userId
PATCH  /api/profile/:userId
GET    /api/opportunities
GET    /api/opportunities/:id
POST   /api/opportunities/:id/analyze
GET    /api/analyses/:id
GET    /api/analyses/:id/readiness
PATCH  /api/readiness/:id
POST   /api/voice/session
POST   /api/voice/action
```

Envelope: `{ data, error }`. Invalid JSON and unknown routes stay in that envelope. Auth is a local `userId` (P1 full auth later).

`FILTER_BY_DECISION` scores the catalog in memory and does **not** persist extra analyses. Voice sessions store id / userId / language / timestamps — not utterance text.

---

## Persistence

Default: JSON file (`STORE_PATH`).  
Target: Supabase/Postgres using `001_init.sql` + RLS when credentials exist. The API does **not** switch automatically yet.

---

## Production

`NODE_ENV=production` requires `CLIENT_URL` as an http(s) origin. Missing `CLIENT_URL` does not fall back to localhost CORS. Claude and Voxide keys stay optional.

---

## AI and voice

| Layer | Now | Must not |
|---|---|---|
| Decision | TypeScript rules | Claude choosing APPLY/MAYBE/SKIP |
| Explanation | Engine summary; Claude if key **and** model are set; JSON validated | Invent requirements, deadlines, or official eligibility |
| Voice | Keyword intents + text/quick actions; backup UI if provider is not `voxide` | Decorative chatbot; claiming live STT |
| Language | English e2e (ADR 004). `en` / `am` / `om` stored | Live Amharic/Oromo speech without Voxide |

---

## ADRs

- `docs/decisions/001-persistence-file-store.md`
- `docs/decisions/002-decision-engine-source-of-truth.md`
- `docs/decisions/003-voice-text-fallback.md`
- `docs/decisions/004-language-english-e2e.md`
