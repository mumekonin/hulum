# Demo screenshots (shot list)

**Status:** shot list only — **no image files in this folder yet**  
**Rule:** Do not invent screenshots or a recorded video. Capture locally when preparing the STARK pack.

## How to capture

1. `npm run db:migrate && npm run dev`
2. Create account + save Abeba facts (see `docs/demo/script.md`).
3. Open http://localhost:3000 in a clean browser window (full desktop width).
4. Save PNGs into this folder with the names below.
5. Do not crop out the HULUM brand or the official-source control.

## Required frames (backup pack)

| File | Route / state | What must be visible |
|---|---|---|
| `01-gateway.png` | `/` | HULUM brand + Sign in / Create account |
| `02-profile.png` | `/profile` after Abeba facts saved | Name + CS / Ethiopia fields |
| `03-opportunities.png` | `/opportunities` | Catalog list **or** honest empty state (investigator) |
| `04-analysis.png` | `/analysis/[id]` after Analyze | APPLY / MAYBE / SKIP + official source when present |
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

When PNG files exist, mark Phase 25 **Prepare backup video/screenshots** in `task.md` for screenshots only (video stays open until recorded).
