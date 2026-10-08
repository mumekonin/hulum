# HULUM backup demo

**Owner:** Kidist  
**Live walkthrough:** `docs/demo/script.md` (about 6 minutes)  
**This file:** shorter path if speech, Analyze, catalog, or the browser UI fails.

There is **no recorded video** in this repository. Required backup **PNG** frames live under `docs/demo/screenshots/` (`npm run capture:demo-screenshots`). Do not show a fake deploy or claim a microphone.

**Current product facts (do not invent older paths):**

- Auth: Create account / Sign in (JWT). No gateway “Continue” UUID, no `POST /api/profile/demo`.
- Profile: type Abeba’s facts (or a pre-saved account). Document photos are optional uploads.
- Catalog: investigator-filled. No baked A2SV / UCT / Chevening seed ids.
- Decision: `decide()` on the server. Screenshot analyze uses the same engine against the signed-in profile.

---

## Do not say (same as the main script)

- Live Voxide / STT
- Claude chooses APPLY / MAYBE / SKIP
- ScholarXIV papers drive APPLY / MAYBE / SKIP, or that archived paper citations exist in the repo
- Production / EthioDeploy
- One-click demo profile or seeded catalog cards

---

## Path A — 3 minutes, text only

Setup: `npm run db:migrate`, `npm run dev`, http://localhost:3000, health at `:3001/api/health`. Sign in with a pre-created Abeba profile.

| Time | Action | Show / say |
|---|---|---|
| 0:00 | `/` welcome → `/sign-in` | Decision agent: APPLY / MAYBE / SKIP, then why and what to prepare. |
| 0:20 | `/profile` | Abeba facts already saved. |
| 0:40 | `/opportunities` → first real card → Analyze | Show whatever decision the engine returns. Fit is a signal. |
| 1:20 | Official source, then back | Confirm with the organization. |
| 1:40 | Ask HULUM | **Voice unavailable** is expected. Type or click the four commands below. |
| 2:50 | Close | One profile, one decision, official source last. |

If the catalog is empty at 0:40, open `/screenshot` instead and analyze one real post photo.

### Exact text / quick actions (English)

On `/assistant` after an opportunity (or screenshot session) is current:

1. `Should I apply for this?`
2. `Why did you say that?`
3. `What am I missing?`
4. `What should I prepare?`

Amharic quick actions exist (`ምን ጎድሎኛል?`, `ምን ላዘጋጅ?`). Do not claim live Amharic speech.

---

## Path B — Analyze button fails or catalog empty

1. Stay signed in with Abeba’s profile.
2. Open `/screenshot`, upload a real opportunity screenshot, run analyze.
3. Or open Ask HULUM and type `Should I apply for this?` when an opportunity id is in session.

If the assistant session fails, keep typing; text fallback is the intended backup when Voxide is not keyed.

---

## Path C — Browser UI is unusable (API)

Judges can still see register + catalog health. From the repo root, with the API on `:3001`:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
$reg = Invoke-RestMethod -Method POST http://localhost:3001/api/auth/register -ContentType application/json -Body (@{
  name = "Judge API"
  email = ("judge." + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + "@example.invalid")
  password = "strong-pass"
} | ConvertTo-Json)
$reg.data.userId
$reg.data.sessionToken
Invoke-RestMethod http://localhost:3001/api/opportunities
```

Expected: health ok, register returns `userId` + JWT, opportunities is an array (length may be 0 if the investigator has not filled yet).

Automated local check:

```powershell
npm run smoke:local
```

Browser click-through (Chromium):

```powershell
npm run smoke:browser
```

File-store twin coverage: `npm test` in `apps/server` (flow / failures / voice text-fallback).

---

## If something else breaks

| Failure | Recovery |
|---|---|
| API down | Show `/api/health`. Restart `npm run dev`. |
| No profile | Create account → save Abeba facts. |
| Empty catalog | `/screenshot` or wait for investigator; do not invent cards. |
| Wrong or surprising decision | Do not override the engine. Open Official source. |
| Microphone asked for | Say speech is not wired; use Path A. |
| Need a second decision and time is gone | Explain MAYBE vs SKIP in one sentence; do not invent seed titles. |

---

## Not in this backup

- Recorded demo video
- Checked-in screenshot PNG files
- Production URL
- Voxide key
- Seeded `opp-a2sv` / demo profile endpoint
