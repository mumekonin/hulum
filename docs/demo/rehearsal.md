# Demo rehearsal (Day 20)

**Date:** 2026-09-19  
**Script:** `docs/demo/script.md`  
**Backup:** `docs/demo/backup.md`  
**Persona:** Abeba Tesfaye

This is a freeze rehearsal against the **file-store** demo (`createApp`, `npm run dev`). It is not a live judge session and not a browser click-through.

---

## What was checked

| Step in the script | Check | Result |
|---|---|---|
| Landing APPLY / MAYBE / SKIP + Create your profile | `apps/web/src/app/page.tsx` | Present |
| Use demo profile (Abeba Tesfaye) | profile page button | Present |
| Open A2SV → Analyze for me | opportunity detail | Present |
| Abeba + A2SV → APPLY | `npm test` (`flow.test.ts`) | Pass |
| UCT → MAYBE | `failures.test.ts` | Pass |
| Chevening → SKIP | `failures.test.ts` | Pass |
| Ask HULUM text: apply / why / missing / prepare | `voice.action.test.ts`, `flow.test.ts` | Pass |
| Voice unavailable / text-fallback | assistant UI + session `provider` | Present |
| Official source | analysis UI + tests | Present |

`npm test` on 2026-09-19: 22 files, 85 tests, all pass.

---

## What was not run

- Clean-browser click-through on localhost
- Microphone / Voxide
- Production host
- Recorded video

If the live UI is down, use Path C in `docs/demo/backup.md` or `npm test`.

---

## What to say (unchanged)

Engine decides. Claude explains only if a key is set. Official source last. Do not claim deploy, ScholarXIV papers, or live speech.

Postgres routers from Mulualem PRs #5–#10 are **not** this walkthrough. Demo Abeba still uses `user_demo_abeba` and seed ids `opp-a2sv`, `opp-mastercard-uct`, `opp-chevening`.
