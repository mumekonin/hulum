# HULUM backup demo (Day 19)

**Owner:** Kidist  
**Live walkthrough:** `docs/demo/script.md` (about 6 minutes)  
**This file:** shorter path if speech, Analyze, or the browser UI fails.

There is **no recorded video and no screenshot pack** in this repository. Do not show a fake deploy or claim a microphone.

Stable inputs already in the product:

- Profile: **Use demo profile** → Abeba Tesfaye (`user_demo_abeba`)
- APPLY: A2SV (`opp-a2sv`)
- MAYBE: Mastercard Foundation Scholars Program at UCT (`opp-mastercard-uct`)
- SKIP: Chevening (`opp-chevening`)

---

## Do not say (same as the main script)

- Live Voxide / STT
- Claude chooses APPLY / MAYBE / SKIP
- ScholarXIV papers in the running app
- Production / EthioDeploy

---

## Path A — 3 minutes, text only (use this if time or voice is the problem)

Setup is the same as `docs/demo/script.md`: `npm run dev`, http://localhost:3000, health at `:3001/api/health`.

| Time | Action | Show / say |
|---|---|---|
| 0:00 | `/` | Decision agent: APPLY / MAYBE / SKIP, then why and what to prepare. |
| 0:20 | `/profile` → Use demo profile | Abeba, CS in Ethiopia, bachelor in progress. |
| 0:40 | Open A2SV → Analyze for me | APPLY. Fit is a signal. Engine decides. |
| 1:20 | Official source, then back | Confirm with the organization. |
| 1:40 | Ask HULUM | **Voice unavailable** is expected. Type or click the four commands below. |
| 2:50 | Close | One profile, one decision, official source last. Mention UCT MAYBE and Chevening SKIP in one sentence if asked. |

### Exact text / quick actions (English)

Use these in order on `/assistant` after A2SV is the current opportunity:

1. `Should I apply for this?`
2. `Why did you say that?`
3. `What am I missing?`
4. `What should I prepare?`

Optional catalog lines (not required in 3 minutes):

- `Show me opportunities I should apply for`
- `Show me maybe opportunities`

Amharic quick actions exist (`ምን ጎድሎኛል?`, `ምን ላዘጋጅ?`). Do not claim live Amharic speech.

---

## Path B — Analyze button fails

Stay on A2SV. Open Ask HULUM. Run command 1 above. `ANALYZE_OPPORTUNITY` uses the same `runAnalysis` path as the button.

If the assistant session fails, keep typing; the UI is already in backup mode when the provider is not `voxide`.

---

## Path C — Browser UI is unusable (API)

Judges can still see the engine. From the repo root, with `npm run dev` (API on `:3001`). The catalog is investigator-filled, not seeded:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
$demo = Invoke-RestMethod -Method POST http://localhost:3001/api/profile/demo
$userId = $demo.data.profile.userId
$ops = Invoke-RestMethod http://localhost:3001/api/opportunities
$a2sv = $ops.data | Where-Object { $_.title -match 'A2SV' } | Select-Object -First 1
Invoke-RestMethod -Method POST "http://localhost:3001/api/opportunities/$($a2sv.id)/analyze" -ContentType application/json -Body (@{ userId = $userId } | ConvertTo-Json)
```

Expected: envelope `{ data, error }`, A2SV **APPLY** for Abeba.

Find Mastercard / Chevening the same way by title → **MAYBE** / **SKIP**.

Or run the automated local triangle (same expectations):

```powershell
npm run smoke:local
```

Automated coverage of the file-store twin path: `npm test` in `apps/server` (`flow.test.ts`, `failures.test.ts`, voice text-fallback tests).

---

## If something else breaks

| Failure | Recovery |
|---|---|
| API down | Show `/api/health`. Restart `npm run dev`. |
| No profile | Use demo profile. |
| Wrong or surprising decision | Do not override the engine. Open Official source. |
| Microphone asked for | Say speech is not wired; use Path A. |
| Need MAYBE / SKIP and time is gone | Say the expected labels; do not invent extra eligibility facts. |

---

## Not in this backup

- Recorded demo video
- Screenshot folder
- Production URL
- Voxide key
