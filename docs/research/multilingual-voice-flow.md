# Multilingual voice / text flow (en / am / om)

**Status:** implemented and TypeScript-clean; live Amharic/Oromo STT still requires a real `vox_pub_…` key  
**Date:** 2026-09-25  
**Owners:** Kidist (widget / UX), Mulualem (API / intent layer)  
**ADRs:** 001 (stack), 003 (text fallback), 004 (English e2e)

---

## What works end-to-end today

### Conversation turn 1 — "show me fellowships" (any language)

| Utterance | Language detected | Intent | Server reply |
|---|---|---|---|
| `show me fellowships` | `en` | `FILTER_OPPORTUNITIES` type=fellowship | `Fellowships: Title — Org; …` |
| `ፌሎሺፕ አሳየኝ` | `am` (Ge'ez) | `FILTER_OPPORTUNITIES` type=fellowship | Groq rewrites to Amharic Ethiopic |
| `fellowshipwwan natti agarsiisi` | `om` (Oromo markers) | `FILTER_OPPORTUNITIES` type=fellowship | `Fellowshipwwan: Title — Org; …` |

**What was fixed:** `voice.opportunities[0]?.id` is now saved as `opportunityId` in the session
after any `FILTER_OPPORTUNITIES` / `SHOW_OPPORTUNITIES` response. Previously only
`voice.opportunity?.id` was checked, which is `undefined` for list responses.

### Conversation turn 2 — "analyze this" (any language)

The `opportunityId` from turn 1 is now attached to the next request.

| Utterance | Language | Intent | What the server returns |
|---|---|---|---|
| `analyze this` / `should I apply?` | `en` | `ANALYZE_OPPORTUNITY` | `APPLY/MAYBE/SKIP. Fit N%. Next: …` |
| `ፌሎሺፕ አናሊሳ` / `ትንተና` / `አወዳድር` | `am` | `ANALYZE_OPPORTUNITY` | Groq rewrites result to Amharic |
| `carraa kana madaali` / `madaaluu` | `om` | `ANALYZE_OPPORTUNITY` | `murteen APPLY/MAYBE/SKIP. Waliin N%…` |

`decide()` on the server produces APPLY / MAYBE / SKIP — Groq only rewrites the
surrounding text. The decision word itself is never rewritten.

### Conversation turn 3 — "why?" / "explain"

| Utterance | Language | Intent |
|---|---|---|
| `why did you say that?` / `explain` | `en` | `EXPLAIN_DECISION` |
| `ለምን?` | `am` | `EXPLAIN_DECISION` |
| `maalif?` / `maaliif?` | `om` | `EXPLAIN_DECISION` |

Groq (`speakInAskedLanguage`) rewrites the stored English summary into the asked language.
APPLY / MAYBE / SKIP are kept as-is (system prompt instructs it).

### Other supported turns

| Intent | en | am | om |
|---|---|---|---|
| Missing requirements | `what am I missing?` | `ምን ጎድሎኛል?` | `maal dhabe?` / `hanqina` |
| Readiness checklist | `what should I prepare?` | `ምን ላዘጋጅ?` | `qopheessuu` / `qopheessi` |
| Opportunity details | `tell me about this` / `details` | `ዝርዝር` / `ስለዚህ እድል` | `ibsi` / `naaf himi` |

---

## Keyword coverage

### `apps/web/src/lib/text-actions.ts` (client-side offline fallback)

```
TYPE_WORDS:
  internship   → /internship|ኢንተርንሺፕ|internshipwwan|hojii barumsaa/
  scholarship  → /scholarship|ስኮላርሺፕ|ስኮለርሺፕ|scholarshipwwan|carraa barumsaa/
  fellowship   → /fellowship|ፌሎሺፕ|fellowshipwwan|carraa qorannoo/  <- ADDED
  grant        → /grant|grantii/                                    <- ADDED
  job          → /job|remote job|hojii/                              <- ADDED
  competition  → /competition|dorgommii/                             <- ADDED
```

### `apps/server/src/voice/intents.ts` (server-side intent parser)

Same TYPE_WORDS additions. The server parser also gained:
- `madaali|madaaluu|apply gochuu|nan apply|አወዳድር|ትንተና` → `ANALYZE_OPPORTUNITY`
- `maalif|maaliif` → `EXPLAIN_DECISION`
- `maal dhabe|hanqina` → `SHOW_MISSING_REQUIREMENTS`
- `qopheessuu|qopheessi` → `SHOW_READINESS`
- `carraawwan|carraa agarsiisi` → `SHOW_OPPORTUNITIES`
- `internshipwwan|natti agarsiisi` show-trigger → `FILTER_OPPORTUNITIES`

### `apps/server/src/voice/replies.ts` (server-side localized templates)

`replyOpportunityList` now has labeled branches for every type:

| type | English | Amharic | Oromo |
|---|---|---|---|
| fellowship | `Fellowships: …` | `ፌሎሺፕ: …` | `Fellowshipwwan: …` |
| scholarship | `Scholarships: …` | `ስኮላርሺፕ: …` | `Scholarshipwwan: …` |
| internship | `Internships: …` | `ኢንተርንሺፕ: …` | `Internshipwwan: …` |
| grant | `Grants: …` | `Grants: …` | `Grantii: …` |
| job | `Jobs: …` | `Jobs: …` | `Hojiwwan: …` |
| competition | `Competitions: …` | `Competitions: …` | `Dorgommiiwwan: …` |
| (all) | `Here are current opportunities: …` | `የአሁን እድሎች: …` | `Carraawwan amma jiran: …` |

---

## How Amharic / Oromo replies are produced

```
Voxide widget
  ↓ tool call: runHulumAction({ text: utterance })
    ↓ detectAskedLanguage(utterance, selectorLanguage)
      → "am" if Ge'ez script, "om" if Oromo markers, else "en"
    ↓ POST /api/voice/action { text, language, opportunityId, analysisId }
      ↓ Server: parseVoiceIntent → decide() / query DB
      ↓ Build reply string from localized template (replies.ts)
      ↓ speakInAskedLanguage(chat, language, reply)
          if language === "am": Groq rewrites → Amharic (Ethiopic script)
          if language === "om": Groq rewrites → Afaan Oromo (Latin script)
          if language === "en" or Groq unset: return template as-is
      ↓ Return { intent, reply, opportunity?, opportunities?, analysis? }
  ↓ VoxideAskHulum: update opportunityId/analysisId session, show reply
```

Groq's rewrite prompt: "Rewrite this HULUM assistant reply in [language].
Keep APPLY, MAYBE, SKIP, opportunity titles, organization names, URLs, and
percentages unchanged. Do not add listings or change the decision."

---

## What is NOT claimed

- **Live Amharic / Oromo STT from Voxide** — public Voxide docs do not publish
  a language matrix. The STT locale hints (`am-ET`, `om-ET`) are passed but
  recognition quality has not been measured. See `voxide-languages.md`.
- **Live mic demo without a key** — `NEXT_PUBLIC_VOXIDE_KEY` (`vox_pub_…`) must
  be set and `http://localhost:3000` whitelisted in the Voxide dashboard.
- **Groq rewrite without `GROQ_API_KEY`** — if the key is unset, the server
  returns the localized template reply. The product still works; replies will be
  shorter template strings rather than full Amharic / Oromo prose.

---

## Backend setup required

Add to `apps/server/.env` (already in `.env.example`):

```env
GROQ_API_KEY=gsk_...          # Required for Amharic/Oromo prose rewrites
GROQ_MODEL=openai/gpt-oss-20b  # Or any Groq OpenAI-compatible model
```

Without `GROQ_API_KEY`, `speakInAskedLanguage` returns the template string
directly. The product still works; replies will be shorter template strings
rather than full Amharic / Oromo prose.

---

## Testing the flow manually

```
1. npm run dev   (web on :3000, server on :3001)
2. Open http://localhost:3000/assistant
3. Create a profile at /profile first
4. In the assistant:
   EN: "show me fellowships"
       "analyze this"
       "why?"
       "what am I missing?"
   AM: switch selector to አማርኛ
       type "ፌሎሺፕ አሳየኝ"
       then  "ለዚህ እድል ምስከረስ"
       then  "ለምን?"
   OM: switch selector to Afaan Oromo
       type "fellowshipwwan natti agarsiisi"
       then "carraa kana madaali"
       then "maalif?"
```

---

## Open items

- [ ] Measure live Amharic/Oromo STT quality with a real `vox_pub_…` key (Phase 13 P1)
- [ ] Add "Repeat that" / "ድገም" to localized readiness / gaps replies
- [ ] Opportunity `title` and `organization` fields are stored in English; consider
      translating them via Groq for v0.2
