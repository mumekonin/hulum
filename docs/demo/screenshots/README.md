# Demo screenshots (shot list)

**Status:** shot list only — **no image files in this folder yet**  
**Rule:** Do not invent screenshots or a recorded video. Capture locally when preparing the STARK pack.

## How to capture

1. `npm run db:migrate && npm run db:seed && npm run dev`
2. Open http://localhost:3000 in a clean browser window (full desktop width).
3. Save PNGs into this folder with the names below.
4. Do not crop out the HULUM brand or the official-source control.

## Required frames (backup pack)

| File | Route / state | What must be visible |
|---|---|---|
| `01-gateway.png` | `/` | HULUM brand + Continue / gateway |
| `02-profile-demo.png` | `/profile` after Use demo profile | Abeba Tesfaye fields |
| `03-a2sv-apply.png` | A2SV analyze result | **APPLY** + official source |
| `04-ask-hulum-text.png` | `/assistant` | Voice unavailable or text path + a quick action reply |
| `05-ask-hulum-amharic.png` | `/assistant` language አማርኛ | Amharic chrome or quick action (text only) |
| `06-uct-maybe.png` | UCT analyze | **MAYBE** |
| `07-chevening-skip.png` | Chevening analyze | **SKIP** |

## Not required (and not claimed)

- Live microphone / Voxide waveform
- Production URL chrome
- EthioDeploy banner

When files exist, mark Phase 25 **Prepare backup video/screenshots** in `task.md`. Until then leave it open.
