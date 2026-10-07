# Demo screenshots (shot list)

**Status:** required PNG frames captured locally via `npm run capture:demo-screenshots` (2026-10-07). **No recorded video yet.**  
**Rule:** Do not invent a video. Re-run the capture script after UI changes; keep frames honest (local host, investigator catalog, text Ask HULUM).

## How to capture

1. `npm run db:migrate`
2. Prefer `INVESTIGATE_WORKER=false npm run dev` so the worker does not starve the DB during capture.
3. `npm run capture:demo-screenshots` (Playwright; uses system Edge/Chrome when bundled Chromium is missing).
4. Manual alternative: create account + Abeba facts (`docs/demo/script.md`), then save PNGs with the names below at full desktop width.
5. Do not crop out the HULUM brand or the official-source control.

## Required frames (backup pack)

| File | Route / state | What must be visible |
|---|---|---|
| `01-gateway.png` | `/sign-in` | HULUM brand + Sign in / Create account |
| `02-profile.png` | `/profile` after Abeba facts saved | Name + CS / Ethiopia fields |
| `03-opportunities.png` | `/opportunities` | Catalog list **or** honest empty state (investigator) |
| `04-analysis.png` | `/opportunities/[id]` after Analyze (old `/analysis/[id]` redirects here) | APPLY / MAYBE / SKIP + official source when present |
| `04b-screenshot.png` | `/screenshot` after analyze (if catalog empty) | Decision from photo + profile |
| `05-ask-hulum-text.png` | `/assistant` | Voice unavailable / text path + a quick action reply |
| `06-ask-hulum-amharic.png` | `/assistant` language አማርኛ | Amharic chrome or quick action (text only) |

## Optional (only if those cards exist in your local catalog)

| File | State |
|---|---|
| `07-maybe.png` | A MAYBE result |
| `08-skip.png` | A SKIP result |

Do not invent UCT/Chevening frames if those titles are not in the investigator list.

## Not required (and not claimed)

- Live microphone / Voxide waveform
- Production URL chrome
- EthioDeploy banner
- Seeded A2SV card

Phase 25 **Prepare backup video/screenshots**: screenshots done in-repo; video stays open until recorded.
