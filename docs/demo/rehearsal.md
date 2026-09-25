# Demo rehearsal

**Date:** 2026-09-25 (post JWT + closed catalog seed)  
**Script:** `docs/demo/script.md`  
**Backup:** `docs/demo/backup.md`  
**Persona:** Abeba Tesfaye (typed / pre-saved account)

This rehearsal matches the **running product**: Postgres + JWT auth + investigator catalog. It is not a live judge session.

---

## What was checked

| Step in the script | Check | Result |
|---|---|---|
| Gateway Sign in / Create account | `AuthGateway` / `AuthInduction` | Present |
| Save Abeba profile facts | profile page `#profile-*` fields | Present |
| Document photo upload | profile documents API | Present (optional in timed demo) |
| Opportunities list | investigator catalog (may be empty) | Present |
| Analyze → decision | analysis UI + `decide()` | Present |
| Screenshot analyze | `/screenshot` | Present (backup when catalog empty) |
| Ask HULUM text / quick actions | assistant + voice action tests | Present |
| Voice unavailable / text-fallback | assistant UI | Present |
| Clean-browser click-through | `npm run smoke:browser` (CI) | Automated on localhost |
| Local API smoke | `npm run smoke:local` (register + catalog list) | Automated |

---

## What was not run / not claimed

- Microphone / Voxide STT
- Production host
- Recorded video / checked-in PNG pack
- Seeded A2SV / UCT / Chevening cards or `POST /api/profile/demo`

If the live UI is down, use Path C in `docs/demo/backup.md`, `npm run smoke:local`, or `npm test`.

---

## What to say (unchanged)

Engine decides. Claude explains only if a key is set. Official source (or screenshot evidence) last. Do not claim deploy, ScholarXiv papers, live speech, or a one-click demo profile.
