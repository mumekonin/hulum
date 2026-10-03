# Changelog

HULUM records actual work. Do not invent history.

## 2026-10-03 — Ask HULUM Oromo lang a11y + smoke:browser

### Changed
- Ask HULUM quick-action buttons: `lang` follows Reply-in (`am` / `om`), not Ethiopic regex only.
- `smoke:browser`: select Afaan Oromo and assert Task 13 `Carraa kana madaali` chip.
- Removed leftover local patch script; task-status synced.

### Why
Oromo chips shipped in Task 13 but a11y `lang` and CI browser smoke did not cover them.

## 2026-10-03 — Task 13 Oromo Ask HULUM text quick actions

### Changed
- Ask HULUM Afaan Oromo: `QUICK_OM` chips + honest language hint; chrome stays English (ADR 004).
- Client `listReply` Oromo strings align with server `replyOpportunityList`.
- `task.md` / `HULUM_task.md`: Phase 13 third language = Oromo text path; STT still open.
- Demo script + `voxide-languages.md` + task-status synced.

### Why
Server already understood Oromo intents; web still forced English quick actions after Amharic text UX shipped.

## 2026-10-03 — Runtime hulum_app role with session RLS

### Changed
- `database/migrations/014_hulum_app_role.sql`: `hulum_app` + grants + `profile_documents` RLS.
- API: `rlsRequestMiddleware` + `dbQuery` / `dbConnect` so request paths `SET LOCAL ROLE hulum_app`.
- JWT (`SESSION_SECRET`) sets `app.current_user_id`; auth/investigator set `app.rls_bypass`; open local keeps bypass.
- Investigator worker wraps DB work in `withServiceRls`.
- Isolation test + docs / Phase 15 annotation.

### Why
RLS policies existed but the API connected as table owner and bypassed them.

## 2026-10-03 — SRS §3–5 as-built Mermaid + Groq judge copy

### Changed
- `HULUM_Documentation.md` §3–5 diagrams/flows: `decide()` + optional Groq; local host; EthioDeploy target; NFR-03 RLS owner-bypass.
- `docs/demo/script.md`: Do-say uses Groq when keyed.
- Task 30 / Phase 10 titles and pipelines → Groq (`task.md`, `HULUM_task.md`, `team_assignments.md`).
- `HULUM_GIT_WORKFLOW_v1.0.md`, ADR 001/002: match tip of tree.
- `docs/stark/task-status.md`: tip-of-main index for this sync.

### Why
After §2 honesty, §3–§5 still diagrammed Claude deciding and EthioDeploy as live.

## 2026-10-03 — SRS §2 NFR/limits + Groq-as-built copy

### Changed
- `HULUM_Documentation.md`: seed limitation note; NFR-02/08 Target/v0.1; language success criterion; closing points to local demo.
- `team_assignments.md`: Claude → Groq in product boundary, Task 30, integration path, working rules.
- `git-workflow.md`: STARK changelog example, analysis contract, Days 17–18 evidence.
- `docs/stark/task-status.md`: tip-of-main index for this sync.

### Why
After §1.2.10, §2 NFRs and team/git-workflow still read as shipped trilingual voice and Claude while tip of tree is Groq-when-keyed + engine decides.

## 2026-10-03 — SRS deliverables + Task 37–38 local verify

### Changed
- `HULUM_Documentation.md` §1.2.10 / NFR-05 / schedule: v0.1 status vs EthioDeploy target; scope note for investigator catalog.
- `task.md` / `team_assignments.md`: Task 37–38 Verify = local/CI, not deployed host.
- `task.md` / `HULUM_task.md`: Production configuration + Claude explanation annotations.
- `docs/stark/task-status.md`: tip-of-main index for this sync.

### Why
SRS deliverables and Task 37 still read as EthioDeploy + trilingual Voxide while tip of `main` is local-only.

## 2026-10-03 — Create account (/verify) OTP honesty

### Changed
- `/verify` (`AuthInduction`): notice + subtitle that route is JWT register, not email OTP; page metadata matches.
- README + demo script: `/verify` = Create account, not OTP.
- `docs/stark/task-status.md`: tip-of-main index for this sync.

### Why
`smoke:browser` and demos land on `/verify`; without on-page copy it still read like email verification after forgot-password was fixed.

## 2026-10-02 — Recovery UI + ScholarXIV/seed judge honesty

### Changed
- `/forgot-password`: honest “email not connected” notice; Continue (no fake Send reset link delay).
- README, narrative, research-questions, demo script/backup/rehearsal: `/research` when keyed; empty paper table; papers do not decide.
- `task.md` / `HULUM_task.md`: seed/demo rows annotated (006 closed; investigator catalog).
- `docs/stark/task-status.md`: tip-of-main index for this sync.

### Why
Recovery UI still advertised email reset, and STARK copy denied ScholarXIV “in the product” while `/research` is on `main`.

## 2026-10-02 — Security / RLS / CI STARK supersession

### Changed
- `docs/stark/task-status.md`: mark HMAC / UI-only auth / `db:seed` CI history as superseded; tip of `main` = JWT + migrate + smokes.
- `task.md` / `HULUM_task.md`: annotate RLS table-owner limit, JWT (no reset email), CI deploy N/A, branch-protection open.
- `docs/product/hulum-flow.md`: `/verify` = Create account, not OTP.
- `HULUM_Documentation.md`: SRS honesty banner pointing at tip of `main`.

### Why
Judge-facing STARK index still implied HMAC preview auth and seeded CI after JWT and migrate-only CI landed.

## 2026-10-02 — Amharic / voice checkbox honesty sync

### Changed
- `task.md` / `HULUM_task.md`: Amharic = text UX (not STT); voice gates annotate text/widget vs live mic; Days 13–14 / Gate 4–6 / MVP Amharic rows honest.
- `docs/product/research-questions.md`, `docs/research/voxide-languages.md`: Amharic text UX shipped; Voxide STT still unverified.
- `docs/stark/task-status.md`: tip-of-main index for this sync.

### Why
Checkboxes still read as “Amharic voice” / “full voice flow” while only Ask HULUM text + widget tools were proven.

## 2026-10-02 — Task 49 DONE + task.md / Oromo chrome honesty

### Changed
- `task.md` / `HULUM_task.md`: Task 49 DONE; EthioDeploy deploy reopened; voice demo = text path vs live mic; multilingual row honest.
- Ask HULUM Afaan Oromo: English chrome + explain-language hint; no invented Oromo UI strings; STT locale stays `en-US` for `om`.

### Why
`rule.md` / `task.md` still claimed IN REVIEW UI, EthioDeploy, full Oromo multilingual, and “demonstrate voice” while mic and Oromo chrome were open/invented.

## 2026-10-02 — Product docs + freeze notes match tip of main

### Changed
- Personas, hulum-flow, problem, ideation: JWT / onboarding / investigator (no seed APPLY triangle).
- Day 19/20 changelog freeze docs + ADR 001: file-store is tests-only; tip of `main` is the product.
- `smoke:browser` visits welcome `/` before Create account; CI step label updated.

### Why
Product and Day-20 freeze pages still described file-store seed demos after product UI landed.

## 2026-10-02 — STARK cover matches product UI on main

### Changed
- `docs/stark/README.md`, `narrative.md`, `git-history.md`, `evidence.md`: tip of `main` is welcome / sign-in / onboarding / Discover.
- `docs/architecture/overview.md`, verification docs, demo rehearsal + screenshot shot list: investigator catalog; analysis on `/opportunities/[id]`.

### Why
Judge entry still told people the web lived only on `feat/*` after product UI landed on `main`.

## 2026-10-02 — STARK task-status honesty after product UI

### Changed
- `docs/stark/task-status.md`: tip-of-main index (JWT, onboarding, investigator, migrations through `013`, CI smokes; no seed APPLY / HMAC-as-auth).
- `docs/stark/evidence.md`, `deployment.md`, `opportunity-import.md`: migrations / catalog import match investigator (seed closed).

### Why
Judges still saw Day-20 HMAC / seed rows as current after the product UI and catalog work landed.

## 2026-10-02 — File-store fixture deadlines past calendar

### Fixed
- `opp-mastercard-uct` and remaining open file-store fixture deadlines in `test-opportunities.ts` moved to 2027 so Abeba→MAYBE UNCERTAIN tests do not SKIP after wall-clock expiry.

### Why
Critical `deadline_open` NOT_MET correctly yields SKIP; the fixture date had expired on the wall clock.

## 2026-10-02 — Welcome page, `/sign-in` route, and auth page redesign

Contributor: Kidist (frontend). Branch `feat/product-ui-transformation`. One backend auth route changed (below); flagged for Mulualem. No migration, shared-contract, or `.env.example` changes.

### Added
- Welcome page at `/`: one large rounded panel over a faint monochrome backdrop. Left: HULUM mark, "Know what is worth your time.", short description, Get started and "Already have an account? Sign in →" (both go to `/sign-in`). Right: an abstract path from opportunities to fit, readiness, and one decision (Apply · Maybe · Skip). Own warm black/white palette (`--wl-*` in `globals.css`), olive used only for small highlights. No login UI.
- Shared `AuthShell`: one centered two-panel card (brand left, form right, stacked on mobile) used by sign-in, create account, and password reset.
- Favicon `app/icon.svg` (serif "H", light and dark variants). Removes the missing `favicon.ico` console error.
- Shared `BrandMark` (circle, peak, olive dot) used on the welcome page, sidebar, mobile top bar, and onboarding header.

### Changed
- Sign-in moved from `/` to `/sign-in`. The auth guard, sign-out, Google callback, reset success, 404 page, and auth-page links point there. `/` forwards `?auth_error=…` to `/sign-in`, so the API's Google redirects are unchanged.
- `GET /api/auth/google` redirects to `/?auth_error=google_unconfigured` instead of returning a raw 503 JSON page when `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` is missing. Sign-in shows "Google sign-in isn't available yet."
- Sign-in, create account, and forgot password rebuilt on `AuthShell`. Logic, request bodies, field IDs, and validation are unchanged, except the forgot-password email is now required (it was optional and only kept in the browser).
- `smoke:browser` starts at `/sign-in`.
- Signed-in app uses the welcome palette: warmer light and darker dark values for the shared `paper` / `surface` / `ink` / `muted` / `line` tokens. APPLY / MAYBE / SKIP colors are unchanged. `h1`–`h3` use EB Garamond instead of Fraunces (Fraunces is no longer loaded). Sidebar active link gets a thin olive marker.

### Removed
- Fake system text on the auth screens: REF numbers, SEC-PROTOCOL, Phase_01/02, Node: preview, "Local gateway · v0.1", coordinates, "Stored as a hash", decision-loop box, and the "Privacy / Terms not published yet" footer (those pages do not exist).
- The "Set new password" preview and strength meter on `/forgot-password`. They stored nothing; the button only showed a notice and redirected.

### Fixed
- Opportunity detail showed literal `?` characters: "??? Discover", "Deadline ?? … ?? N days left", and "Analyzing???". Now "← Discover", "Deadline · … · N days left", and "Analyzing…". The file had them since it was first written.
- Discover filter selects inherited the wide letter-spacing of their uppercase labels, so their values looked like a different font.
- Elements that only get focus from code (`tabindex="-1"`: onboarding step heading, profile edit heading, error heading, analysis result, skip-link target) drew a hard 2px outline because the global `:focus-visible` rule overrode their `outline-none`. Keyboard focus rings on links, buttons, and fields are unchanged.
- Mobile menu: on short screens (phone held sideways) the bottom of the menu, including Sign out, could not be reached because the menu sits in the sticky header. It now scrolls inside itself. The Screenshot / How HULUM works / Research links sit under a "More" label, as on desktop.
- How HULUM works led with "Create your profile", but only signed-in users who already went through onboarding can open it. It now leads with "Browse opportunities"; the profile button reads "Review your profile".

### Why
The first screen was a sign-in form crowded with invented metadata. Now a signed-out user sees what HULUM does, then one calm card to sign in.

### Evidence
Commits `442b94e`, `37f3d89`, `4f561a3`, `a34b25f`, `a79df30`, `fba8eb3`, `4191e9e`, `7b71d6f`, `655fd83`, `37a2c32`, `7ab3864`, `4fb3a75`, `6f0480a`, `60be655`, `7603649`, `183ef20`, `830965c`, `2db30ac`, `fd32bc5`, `7aa6598`. Server: 287 tests pass, including a new Google-unconfigured redirect test; `tsc` clean. Web: ESLint and `tsc` clean. Browser checks (Playwright in Edge), light and dark: welcome page at 1440, 1280, 820, and 390px; sign-in at 1440, 1024, 820, and 390px; create account and forgot password at 1440 and 390px; Discover, My opportunities, and How HULUM works at 1440px, plus Discover at 390px; profile, opportunity detail, Ask HULUM, and Readiness at 1440px, plus opportunity detail at 390px; My opportunities, onboarding, Screenshot, Research, and How HULUM works at 1440 and 390px (API stubbed with `[TEST]` fixtures in the test only). Onboarding heading focused from code has no outline, and Tab still gives the next field a 2px ring. Mobile menu at 390×844, 390×667, and 844×390, light and dark: opens with focus on the first link, Escape closes and returns focus to Menu, current page marked, theme toggle works while open, links navigate and close the menu, Sign out reachable at every size. Checked: the welcome page has no form, Google, or email/password text, and its links open `/sign-in`; sign-in password toggle, required email, login request body, error notice, Google redirect, and `auth_error` notices; create-account request body and error; forgot-password required email and notice; signed-out `/opportunities` goes to `/sign-in`. Not run: `smoke:browser` end to end (no local `DATABASE_URL`), and live Google OAuth (no client id/secret).

## 2026-09-29 — Product UI transformation, onboarding, and Ask HULUM redesign

Contributor: Kidist (frontend). Branch `feat/product-ui-transformation`. Backend, migration, and shared-contract changes below were agreed with Mulualem. No `.env.example` changes.

### Added
- Light and dark mode: follows the OS setting until the user picks one, choice stored in the browser, no flash on load. The Voxide widget follows the theme.
- Quiet left sidebar on desktop, compact top bar and menu on mobile, account block with initials avatar.
- Discover (`/opportunities`): natural-language search over the stored catalog ("AI scholarships for Ethiopian students"), type chips, deadline / location / field / education / experience filters, closed listings hidden by default. Search is keyword matching on stored fields; words no listing contains are ignored and shown as ignored.
- Opportunity detail: "Should you apply?" analyzes inline. Decision section shows Why / What to check / Not met, next step, and fit signal marked advisory. Readiness shows "X / Y ready". Official link uses the stored `applicationUrl`, else `sourceUrl`, and says HULUM does not submit applications. `/analysis/[id]` redirects to the opportunity page.
- Ask HULUM (`/assistant`): conversation thread with decision, list, and batch cards built from server results; opportunity context bar; "Using your HULUM profile · N% complete"; recent questions (this browser only, per user, last 10, cleared on sign-out); 11 fixed FAQ answers (no AI call); "Which of these should I apply for?" from Discover runs the existing analyze endpoint on up to 10 results.
- Mic button on Ask HULUM that starts and stops the same browser Voxide session as the widget. Spoken answers render the same cards. Voice status says when voice is unavailable, loading, live, or failed.
- Onboarding (`/onboarding`, 4 steps: about you, education, skills and experience, CV). New accounts land here; others land on Discover.
- Profile page: read-only view with derived headline and completion, edit mode with Saving… / Saved, private CV section (view, download, replace, remove), other documents.
- Route error, loading, and not-found screens; page titles.
- `GET /api/analyses` (optional `?opportunityId=`): the session user's latest analysis per opportunity with readiness done/total. Shared type `AnalysisSummary`.
- Migration `011_saved_opportunities.sql` and `GET/POST /api/saved`, `DELETE /api/saved/:opportunityId`. Shared type `SavedOpportunity`. Both endpoints take the user from the verified session token and require it even in open local mode.
- My opportunities (`/my-opportunities`): saved listings, then analyzed ones grouped APPLY / MAYBE / SKIP from stored results.
- Readiness (`/readiness`): preparation progress per analyzed opportunity, soonest deadline first; closed ones folded away.
- Discover: "Your decision" filter (Apply / Maybe / Skip / Not analyzed yet) and a "Your fit" badge on analyzed rows, both from stored analyses.
- Opportunity detail: Save opportunity; reopens the user's latest stored analysis on any visit.

### Changed
- Sign-in, sign-up, and Google callback route by profile state instead of always opening `/profile`.
- Profile edit no longer shows name and email as editable (`PATCH /api/profile/:userId` never saved them) or "years of experience" (never stored).
- 44px minimum tap targets, no iOS input zoom, reduced-motion handling, sticky bars clear the voice launcher.
- `smoke:browser` walks onboarding instead of the old profile form.
- Registration creates the empty profile with `education_level` and `country` null instead of `bachelor_in_progress` / `Ethiopia`. Existing rows are not rewritten (a preset cannot be told apart from a real answer).
- API CORS now allows `DELETE`. Browsers were blocking every `DELETE` preflight, so removing a saved opportunity, and removing or replacing a CV on the profile page, failed in the browser while server tests (no Origin header) passed.

### Removed
- Fake "State simulation" bar on the sign-in screens; unused `Header`, `OpportunityCard`, `RequirementList`.

### Why
HULUM looked like a listing site with a form. The redesign makes the product question — should I apply? — the centre of every screen, keeps the decision engine as the only source of APPLY / MAYBE / SKIP, and gives new users a guided setup.

### Decisions
- APPLY / MAYBE / SKIP, summary, and next action are shown exactly as returned by `decide()`; the UI never recomputes them.
- Missing profile facts stay uncertain; onboarding does not keep the registration placeholder's education and country.
- Recent questions stay in the browser; `retention.md` is unchanged (no utterance text server-side).
- Voice stays a Voxide browser widget; no Express STT/TTS.

### Evidence
Commits `06e356d`, `3f3ad2c`, `c42bbc4`, `aa349d1`, `def1a40`, `49cc35f`, `0543b69`, `311c797`. `npm run build` and `npx eslint apps/web/src` pass. Server: new `history.test.ts` (6) and the 011 schema test pass; 266 of 267 server tests pass. The one failure, `failures.test.ts` "returns MAYBE when a stored requirement is UNCERTAIN", is date-bound: its file-store fixture `opp-mastercard-uct` has deadline 2026-09-30, which has passed, so `decide()` correctly returns SKIP.

End-to-end on a throwaway local Postgres 17 (migrations 001–011 applied clean, one `[TEST]` listing inserted, `example.invalid` source): 23 API checks (session required, forged token rejected, latest-per-opportunity, readiness counts, filter, user isolation for analyses and saves, idempotent save, unknown-opportunity 404); `smoke:browser` passes (run in Edge, Playwright's Chromium download failed); 17 browser checks of save, analyze, reopen, My opportunities, Readiness, the Discover decision filter, nav, and mobile dark layout. Only console error: missing `favicon.ico` (pre-existing). Not yet verified: live mic with a `vox_pub_…` key.

## 2026-10-01 — Job filter stays empty until Afriwork posts are saved

### Changed
- The worker stays on configured boards (Afriwork, EthioScholarship) instead of following every official org homepage.
- Afriwork `/jobs/{id}` pages are parsed from the deadline and requirement sentences on the page, without Groq.
- The Job filter empty state no longer says “curated records.”

### Why
The catalog had scholarships and internships only. Afriwork never finished because other hosts ate the run, and Groq often returned unavailable.

## 2026-10-01 — Afriwork Explore jobs browser render

### Changed
- The investigator opens [Afriwork Explore jobs](https://afriworket.com/jobs) in Chromium when the static HTML has no `/jobs/{id}` cards, then follows those job pages.
- A job is saved only when the rendered page shows a deadline and requirement sentence. Past deadlines stay expired.

### Why
Afriwork draws the job list after JavaScript. A plain download of Explore jobs has no listings, so HULUM could not invent them.

## 2026-10-01 — EthioScholarship catalog crawl

### Changed
- The investigator follows each source `sitemap.xml` and EthioScholarship `/scholarships/{slug}` pages, newest/detail first.
- Past deadlines stay rejected or are marked `EXPIRED`. Index, filter, and empty SPA shells are not sent to Groq.
- EthioScholarship starts at `https://scholarship.et/scholarships`. One run may check up to 800 pages for 20 minutes.

### Why
The previous run hit 80 pages of nav/index HTML and saved one row, while scholarship.et lists hundreds of open scholarships on its sitemap. Afriwork `/jobs` is a client-rendered board with no listing HTML or job sitemap entries, so HULUM still cannot invent those jobs.

## 2026-10-01 — Afriwork jobs source

### Added
- Investigator source `Afriwork jobs` at `https://afriworket.com/jobs` (lead). Employer official URLs are preferred when the page shows them.

### Why
The catalog needed an Ethiopia jobs board among the configured sources.

## 2026-10-01 — Investigator rewrites listings from every configured source

### Changed
- Each run fetches every enabled `WEB_PAGE` source first, then follows listing links for up to three minutes.
- A listing already in the catalog is rewritten from the page (deadline, description, URL, requirement sentence). A past deadline becomes `EXPIRED`.
- The worker repeats every 30 minutes by default.

### Why
The previous 15-second run only stamped “seen again,” so the same handful of rows sat unchanged.

## 2026-09-27 — Analyze uses profile facts and uploaded document content

### Added
- Uploaded profile documents extract readable text (PDF locally; images via Groq vision when configured) and cache it for Analyze.
- Live `decide()` matches required documents from upload labels (CV ↔ resume synonyms) and uses document text as experience/field evidence only.

### Why
Document photos were stored but ignored by the postgres matcher, so Analyze could not see documents the user already held.

## 2026-09-26 — Voice does not loop one scholarship question

### Fixed
- One spoken request now runs HULUM once. Partial speech and HULUM’s own list/SKIP reply are not treated as new questions.
- “I can’t analyze…” from Gemini is a refusal, not Analyze.

### Why
The widget re-sent its own spoken answer as the next user utterance, so Ask HULUM flooded with the same scholarships and SKIP result.

## 2026-09-26 — Voice does not apologize before the HULUM result

### Fixed
- Asking by voice for scholarships (or any website action) no longer speaks “I’m sorry, I don’t have the ability” first.
- The widget cuts that refusal off and speaks the same `POST /api/voice/action` result as typed Ask HULUM.

### Why
Gemini Live sometimes refused before calling a tool. Recovery already ran HULUM, but the apology was spoken first.

## 2026-09-25 — STARK evidence + API docs match JWT

### Changed
- `docs/stark/evidence.md` / `README.md`: JWT auth, investigator catalog, CI smokes (no seed APPLY).
- `docs/architecture/api.md` + `data-exposure.md`: `/api/auth/*`, JWT session, screenshot analyze.
- `docs/research/product-links.md`, `database/README.md`: JWT + closed seed.
- Forgot-password copy no longer claims passwords are not stored.

### Why
Judge-facing evidence and API docs still described HMAC UUID demo auth after JWT landed.

## 2026-09-25 — Deployment guide + screenshot smoke

### Changed
- `docs/stark/deployment.md`: JWT secrets, migrations through `009`, investigator (no seed), CI smokes.
- `smoke:browser` opens `/screenshot` and checks the upload UI (no Groq / no fake analyze).

### Why
Keep deploy docs honest after auth/catalog changes, and lock the screenshot backup route in CI.

## 2026-09-25 — README + recovery copy match JWT product

### Changed
- Root README: JWT auth, investigator catalog, screenshot analyze, smokes; removed `POST /api/profile/demo`.
- Forgot-password UI copy no longer claims browser UUID Continue sessions.

### Why
Judges reading README or `/forgot-password` must see the same product as Create account / Sign in.

## 2026-09-25 — Demo walkthrough matches JWT product

### Changed
- Judge script, backup paths, rehearsal, and screenshot shot list: Create account / typed Abeba, investigator catalog, `/screenshot` when the list is empty.
- Removed Continue UUID, Use demo profile, and seeded A2SV/UCT/Chevening from demo docs.

### Why
STARK honesty — the walkthrough must match the running JWT + investigator product.

## 2026-09-25 — Profile form accessible labels

### Fixed
- Profile fields use explicit `htmlFor` / `id` (including **Languages**). Helper text is no longer part of the accessible name.
- `smoke:browser` fills profile fields by `#profile-*` ids.

## 2026-09-25 — Site-wide voice after login

### Changed
- Voxide mounts on every page after login (Journey, Opportunities, Profile, Ask HULUM, Screenshot, Research).
- “Analyze for me” / “analysis” runs `decide()` on the current or first matching opportunity and speaks the full result (decision, fit, summary, next step, gaps, official source).
- Voice can open the same pages a signed-in user can click. Profile facts are still not saved by voice.

### Why
Voice lived only on Ask HULUM, and “analysis for me” did not attach an opportunity or read the full analysis.

## 2026-09-25 — Voxide speaks the HULUM reply

### Fixed
- Widget tools return a plain string so Gemini Live can speak the HULUM result. Voice stays `en-US` (public Voxide docs do not list Amharic/Oromo TTS). If the agent says “I’m sorry”, HULUM still runs the request and asks the widget to read that answer.

### Why
Typing worked. Voice apologized because the tool returned a complex object and the widget asked for unsupported speech locales.

## 2026-09-25 — Voxide named capabilities

### Fixed
- The Ask HULUM widget registers `showScholarships`, `showInternships`, and the other product actions as separate Voxide capabilities. Gemini matches “show me scholarship” to a real tool instead of saying it has no ability.
- If the agent still refuses, HULUM runs the last product request on the same `runTextAction` path.

### Why
Voxide is capability-first. One generic `runHulumAction` tool did not look like a scholarship listing capability.

## 2026-09-25 — Ask HULUM replies in the asked language

### Changed
- Ask HULUM detects English, Amharic (Ge'ez), or Afaan Oromo from the current request and answers in that language.
- “Show me scholarship and analysis” lists stored scholarships, then `decide()` on the first one against the signed-in profile.
- Details / explain / gaps / readiness use the same asked language. Groq may rewrite the reply when set; APPLY / MAYBE / SKIP stay from `decide()`.
- Voxide widget sends `en-US`, `am-ET`, or `om-ET` as a locale hint. Public Voxide docs still do not list Amharic/Oromo STT.

### Why
Voice was English-only even when the user asked in Amharic or Afaan Oromo.

## 2026-09-25 — Voxide widget uses the same voice actions

### Changed
- Ask HULUM text and the Voxide widget call `POST /api/voice/action` first. APPLY / MAYBE / SKIP still come from `decide()`.
- Widget accepts `NEXT_PUBLIC_VOXIDE_KEY` or `NEXT_PUBLIC_VOXIDE_PUBLIC_KEY` (`vox_pub_…` only).
- Speech locale stays `en-US`. The selected HULUM language is sent on the action for explain/readiness.

### Why
Task 32/33: a real voice request must run the same product actions as text. Voxide stays a browser widget, not an Express STT server.

## 2026-09-25 — List stored requirements

### Fixed
- Opportunity and screenshot pages no longer show empty requirement bullets.
- Investigator saves the page’s requirement sentence into `other_requirements` so later analysis can list it.

### Why
Extracted listings left education/field/experience/language empty, and the UI still drew four blank bullets.

## 2026-09-25 — Profile document photos

### Added
- Profile “Documents you already have” accepts a JPEG, PNG, WebP, or PDF photo (up to 8 files, 4 MB each).
- `POST/GET/DELETE /api/profile/:userId/documents` stores the file. Labels become `documentsHeld` for matching.

### Why
The field was a text box and was not saved. People need to upload a photo of a CV or transcript they already have.

## 2026-09-25 — Screenshot analysis

### Added
- Users can upload a Telegram/LinkedIn (or other) screenshot. Groq vision extracts visible facts only.
- `POST /api/ai/screenshot-analyze` then `decide()` against the signed-in profile. Not saved to the catalog.
- `/screenshot` page. Missing deadline or URL stays unknown.

### Why
People see posts outside the catalog. HULUM should analyze the photo they already have, without inventing apply links.

## 2026-09-25 — Browser smoke Ask HULUM locator

### Fixed
- `smoke:browser` clicks Ask HULUM via Primary nav (`exact: true`) so Playwright does not hit strict-mode duplicates with in-page CTAs.

## 2026-09-25 — Browser smoke on JWT gateway

### Added
- `npm run smoke:browser` — Playwright: Create account → save profile → Opportunities → Ask HULUM text fallback.
- CI Chromium install + browser smoke after web build (localhost only).

### Changed
- Marked **Test clean browser/device** / **Browser/device testing** for this automated pass (not mic, not seed APPLY).

### Why
Replaces the pre-auth Continue/demo/A2SV smoke after JWT + closed catalog seed landed on main.

## 2026-09-24 — JWT session and Google OAuth

### Added
- Email/password register and login (`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`).
- HS256 JWT in `X-Hulum-Session` (7 days). Passwords stored as scrypt hashes.
- Google OAuth (`GET /api/auth/google` → callback). Same-email Google and password accounts are linked.
- Product pages require a signed-in session. Sign out is in the header.
- Migrations `007_user_password_hash.sql` and `008_user_google_sub.sql`.

### Removed
- Gateway UUID continue, Abeba demo fill on Profile, and `POST /api/profile/demo` on the Postgres API.

### Why
The gateway looked like login but was a local UUID. Production sign-in is JWT plus Google, not a demo credential.

### Evidence
Auth unit tests (password, service, routes, JWT). Live `GET /api/auth/google` redirects to Google accounts.

## 2026-09-24 — Investigator 15s catalog budget

### Changed
- Each investigate run stops at 15 seconds.
- Pages fetch 8 at a time; Groq extract runs 3 at a time. No 800ms gap. Fetch timeout 4s.
- Worker starts immediately (no 15s boot delay).

### Why
A sequential 80-page crawl was too slow. The catalog must fill within 15 seconds without inventing listings.

## 2026-09-24 — Catalog seed closed

### Removed
- `db:seed` no longer inserts A2SV / Chevening / other curated cards.
- Mapper no longer overlays seed requirement matchers onto Postgres rows.
- Migration `006_close_catalog_seed.sql` deletes those VERIFIED seed rows from existing databases.

### Changed
- `smoke:local` and CI check health + demo profile + catalog list. They do not require seeded A2SV APPLY.

### Why
The live list is the investigator. A baked-in seed catalog is closed.

## 2026-09-24 — Investigator follows aggregator listings

### Changed
- Worker follows internship/scholarship links on aggregator pages (scholarship.et and others), not only pre-listed official hosts.
- An evidenced listing may be saved with the official org URL, or with the aggregator listing URL if that is the page we fetched.
- Extract pulls every evidenced opportunity on the page (up to 20). Fetch budget is 80 pages per run.
- `official_domains` is no longer a save gate. Invented deadlines/URLs and private hosts are still rejected.

### Why
The catalog never grew because new hosts were dropped before extract. Production discovery has to follow real posts. It still must not invent them.

## 2026-09-24 — Background investigator worker

### Added
- Investigate worker starts with the API: interval (default 6 hours) plus an optional run after boot.
- Duplicate official listings refresh `investigated_at` instead of being rejected.
- AI-extracted rows not seen again for 3 days become `NEEDS_REVIEW`.
- Migration `005_investigator_worker.sql` adds official catalog hosts/sources (not aggregators).

### Why
The opportunities list was a static seed. Production needs a scheduled fetch/extract pass, not a person reseeding or Groq inventing posts.

### Decision
`decide()` is unchanged. The worker only stores evidenced official pages. Seed stays a demo fallback.

## 2026-09-24 — Demo-triangle smoke + Amharic as second language

### Changed
- `smoke:local` (and CI) now asserts Abeba → A2SV **APPLY**, UCT **MAYBE**, Chevening **SKIP**.
- Marked **Add second language** for Amharic Ask HULUM text UX (not live STT).
- Afaan Oromo language option: explain/readiness language only; chrome stays English with an honest hint (no invented Oromo UI copy).

### Why
Lock the demo decision triangle in CI and close the Amharic text-language checkbox without claiming Oromo chrome or voice.

## 2026-09-24 — CI local smoke + Amharic demo step

### Added
- CI: seed catalog + `smoke:local` (Abeba → A2SV APPLY) after unit tests.
- Demo script optional Amharic text step; screenshots shot list under `docs/demo/screenshots/`.

### Changed
- Marked **Demonstrate Amharic if stable** for the text/quick-action demo path (not live STT).

### Why
Catch Postgres demo regressions in CI and document the Amharic text demo without inventing mic or screenshot files.

## 2026-09-24 — Amharic Ask HULUM text UX + local smoke

### Added
- Amharic chrome copy + prioritized Amharic quick actions on Ask HULUM when language is `am` (text UX only).
- `npm run smoke:local` — health → demo profile → A2SV APPLY (local API, not production).

### Changed
- Marked Days 13–14 **Amharic voice/UX if stable** for text UX; live Amharic STT / Demonstrate Amharic stay open.

### Why
Ship usable Amharic text assistant chrome without inventing Voxide STT quality.

## 2026-09-24 — Postgres demo profile + demo doc ports

### Added
- `POST /api/profile/demo` on the Postgres API (idempotent Abeba Tesfaye persona).
- `docs/ops/branch-protection.md` — how to require CI before merge (admin still must enable).

### Fixed
- Demo script / backup Path C used `:4000` and file-store `opp-a2sv` ids; now `:3001` + list-by-title for Postgres.

### Changed
- Marked demo **Demonstrate voice** for Ask HULUM text/quick-actions (ADR 003; not live mic).
- Marked multilingual research question for shipped text intents + language selector (second-language e2e still open).

### Why
Make the API backup path work on the real `npm run dev` stack and close honest demo/docs leftovers.

## 2026-09-24 — Ask HULUM language + profile-by-voice honesty

### Changed
- Ask HULUM explain / readiness-plan calls use the selected UI language (`en` / `am` / `om`), not hard-coded English.
- Marked AI may multilingual assist + rephrase (API language path); profile extract via Ask HULUM text/voice tools with confirm-before-save.
- Marked product-implemented Phase 1 research questions; left ScholarXIV/empirical voice questions open.
- Demo rehearsal note: local Postgres, not file-store.

### Why
Wire the language selector into explanations and close remaining items that already ship without a host or live mic.

## 2026-09-24 — Voxide integration checkbox + mixed-language text tests

### Added
- Mixed English + Amharic keyword intent tests (text path only; no STT claim).

### Changed
- Marked Days 10–12 **Voxide integration** done (widget + study; mic still open).
- Marked Phase 13 **Test mixed-language input** for the text intent path.
- Refreshed `docs/stark/evidence.md` (Postgres, session auth, optional Voxide widget).

### Why
Close integration/docs that already ship without inventing a live mic demo.

## 2026-09-24 — English product tests + production config docs

### Added
- English opportunity terminology + decision-explanation tests (`apps/server/src/language/english-product.test.ts`).
- `docs/stark/research-evidence.md` Day 19 research evidence index.
- Deployment guide sections for production database steps and secrets (`SESSION_SECRET`, etc.).

### Changed
- Marked Phase 13 terminology/explanation tests, Phase 23 configure database/secrets, and Day 19 research evidence done (config/docs ready; deploy/host still open).

### Why
Close remaining items that do not require a public host, live mic, or ScholarXIV paper pull.

## 2026-09-24 — Session auth, RLS policies, profile create fix

### Added
- HMAC `X-Hulum-Session` tokens (`SESSION_SECRET`); enforced when set and required in production.
- Migration `004_rls_owner_policies.sql` with owner-scoped RLS policies + public opportunity read.
- Profile create accepts optional client `userId` so gateway local UUIDs are not orphaned.

### Fixed
- Profile form no longer PATCHes a missing profile after gateway Continue (POST with stored UUID instead).

### Changed
- Web stores/sends session token; profile/analyze/voice/analysis routes authorize when sessions are enforced.
- `database/README.md` and data-exposure notes match Postgres + session reality.

### Why
Close Phase 15/19 authz/RLS P1s without inventing OAuth, and fix the gateway→profile path.

## 2026-09-24 — Remaining-task honesty sync

### Added
- `docs/research/product-links.md` mapping research notes to ADRs and shipped behavior.
- Expanded Phase 3 voice-enabled opportunity systems scan in competitive analysis.

### Changed
- `task.md` / `HULUM_task.md`: marked AI may/must-not rows, Postgres connection, research links, and Gate documentation that the product already satisfies.
- Refreshed `docs/stark/task-status.md` for post–Day 20 reality (auth UIs stay UI-only; deploy/Voxide/JWT stay open).

### Why
Close stale open checkboxes without inventing a host, live mic, or JWT auth.

## 2026-09-24 — Auth induction gateway (UI only)

### Added
- `/verify` OTP + admission-success panels in the dark gateway shell (EB Garamond + JetBrains Mono).
- Demo auto-fill `849201` and any 6-digit UI gate; Begin Profile Setup continues with local UUID → `/profile`.
- Gateway “Create account” links to `/verify`.

### Why
Port the induction mock without inventing email OTP, AES/session telemetry, or institutional IdP.

## 2026-09-24 — Failure suites run under Vitest only

### Fixed
- Moved Phase 20 failure-message tests to Vitest (`shared-failure-messages.test.ts`).
- Removed duplicate `error-handler.node.test.ts` (coverage already in `error-handler.test.ts`).
- `tsx --test` now only runs `engine.node.test.ts` and `search.node.test.ts`.

### Why
CI still failed when Vitest collected Node-runner copies of the same suites. One runner per file removes “No test suite found”.

## 2026-09-24 — Node-runner tests use *.node.test.ts

### Fixed
- Renamed all `node:test` suites to `*.node.test.ts` and excluded that pattern from Vitest `include` discovery.
- `npm test` runs Node suites only via `tsx --test`; Vitest no longer collects them (fixes “No test suite found”).

### Why
Vitest was still discovering Node-runner files that import `describe`/`it` from `node:test`, failing CI after those suites already passed under `tsx --test`.

## 2026-09-24 — Exclude node:test files from Vitest

### Fixed
- Vitest no longer discovers `shared-failure-messages.test.ts` and `error-handler.node.test.ts` (they run only under `tsx --test` / `node:test`).
- `npm test` also passes Vitest `--exclude` for those paths (belt-and-suspenders with `vitest.config.ts`).

### Why
CI failed with “No test suite found” when Vitest re-scanned Node-runner files that import `describe`/`it` from `node:test`.

## 2026-09-24 — Auth recovery gateway (UI only)

### Added
- `/forgot-password` recovery matrix UI (request + set-password panels) in the dark gateway shell.
- Reset / send-link actions stay honest: no email token, no password store; optional Continue opens Profile via local UUID.

### Why
Match the recovery mock visually without inventing mail dispatch, TLS auth claims, or account recovery.

## 2026-09-24 — Auth gateway landing (UI only)

### Added
- Dark `/` gateway screen (EB Garamond + JetBrains Mono) matching the auth mock layout.
- Continue starts/continues a local UUID session and opens Profile; Google / password show an honest “not wired in v0.1” notice; Create account opens `/verify`.
- Former home journey content moved to `/journey` under the existing paper product shell.

### Why
Port the entry visual without inventing OAuth, password accounts, encryption claims, or fake precision metrics. Auth remains Phase 16 P1.

## 2026-09-23 — Phase 20 failure tests

### Added
- `503 DATABASE_UNAVAILABLE` mapping for Postgres connection failures (no URL/secret in the body).
- Shared client failure copy for network interruption, mic unavailable, and recognition failure (`@hulum/shared` + web re-export).
- API failure test: contradictory years vs experience text stay `UNCERTAIN` (MAYBE), not invented MET.
- `docs/architecture/failure-tests.md` index for Phase 20 rows.
- `node:test` suites for failure messages and DB error mapping (`npm run test:failures`) so local runs do not depend on a broken web test path.

### Why
Phase 20 asked for failure coverage without inventing a production deploy or claiming live mic STT.

## 2026-09-23 — Milestone git tags

### Added
- Annotated `milestone/*` tags on real commits (`foundation-web-api`, `vertical-slice`, `ci-build-gates`, `postgres-ask-hulum`, `v0.1-local`).
- `docs/stark/milestones.md` lists tag → SHA → what each marks (local-only; not a production release).

### Why
Phase 27 P1 asked for milestone tags without manufacturing SemVer product releases or rewriting history.

## 2026-09-23 — Voice profile extract (propose only)

### Added
- Voice intent `UPDATE_PROFILE` + `replyHint: profile_extract` for utterances like “Extract profile from this: …”.
- Postgres and file-store voice handlers call `proposeProfileExtract` and reply with proposed fields; nothing is persisted until the user confirms on Profile.
- `stripProfileExtractDescription` strips the request prefix before Groq sees the self-description.

### Why
Phase 12 P1 asked to create/update profile by voice without silently writing stored facts — reuse the existing propose → confirm → save path from Phase 5.

## 2026-09-23 — Deployment guide and ops API docs

### Added
- `docs/stark/deployment.md` expanded as the Phase 26 deployment guide (local-only decision; no fake deploy job).
- Ops audit/debug routes documented in `docs/architecture/api.md` (`/api/ops/summary`, decision-debug, client-event).

### Fixed
- `docs/demo/backup.md` health URL uses `:3001` (not `:4000`).

### Why
Phase 14 audit/debug, Phase 24 “deployment workflow if appropriate”, and Phase 26 deployment guide asked for honest docs against the shipped local stack — without inventing EthioDeploy or branch protection.

## 2026-09-23 — Voice latency and recognition ops signals

### Added
- `timeOps` on Postgres `POST /api/voice/session` and `/api/voice/action`.
- `POST /api/ops/client-event` whitelist for `VOICE_RECOGNITION_FAILED` / `VOICE_SESSION_ERROR` / `VOICE_SILENCE_TIMEOUT` (no transcripts).
- `VoxideAskHulum` reports those codes when the widget errors, session fails, or silence times out.

### Why
Phase 22 asked for voice latency, recognition failures, and session failures without logging utterance text.

## 2026-09-23 — Voxide language support verified from public docs

### Added
- `docs/research/voxide-languages.md`: public Voxide docs do not list Amharic/Oromo; English stays the only stable end-to-end claim (ADR 004).

### Why
Phase 13 P0 asked to verify Voxide supported languages before adding a second language. Inventing a matrix would break STARK evidence rules.

## 2026-09-21 — Postgres Ask HULUM voice routes

### Added
- Postgres `/api/voice/session` and `/api/voice/action` use `decide()` / analysis services (text fallback works on `npm run dev`).
- `docs/research/voxide-integration.md` notes the browser-widget development path (ADR 001).

### Why
After switching the default store to Postgres, Ask HULUM had an empty voice router. Browser Voxide UI on `/assistant` already ships as `VoxideAskHulum` (see below); this slice wires the server voice actions.

## 2026-09-23 — AI profile extract with confirmation

### Added
- `POST /api/ai/profile-extract` — Groq proposes profile fields from a self-description; never auto-saves.
- Profile page “Propose profile fields” → Confirm into form → Save (existing create/patch).
- Ask HULUM text action for extract proposals (confirmation still on Profile).

### Why
Phase 5 P1s asked for AI profile extraction with an explicit confirmation step before stored facts change.

## 2026-09-23 — API, retention, verification, and deployment docs

### Added
- `docs/architecture/api.md` — endpoints (including research/investigate), Zod validation, explain rate limit, CORS/secrets.
- `docs/architecture/retention.md` — what is kept; no audio/transcripts; no purge cron yet.
- `docs/architecture/data-exposure.md` — honest review of API/web/DB exposure (UUID `userId` demo risk).
- `docs/architecture/manual-verification.md` and `docs/product/opportunity-verification.md` — teammate catalog verification + 30-day stale rules.
- `docs/stark/deployment.md` — local-only deploy decision; EthioDeploy not used.

### Why
Phase 14–16, 23, and security P1s asked for documentation of validation, rate limits, retention, data exposure, verification, and deployment against the shipped Postgres API — without inventing OpenAPI, a public URL, or a purge job.

## 2026-09-23 — Voxide study, ScholarXIV MCP note, import decision

### Added
- `docs/research/voxide-integration.md`: browser `@voxide/react` widget requirements; no install claim on `main`, no mic claim.
- `docs/architecture/opportunity-import.md`: curated catalog only; bulk import not required for v0.1.

### Changed
- `docs/research/scholarxiv.md`: MCP exploration closed; Papers API remains the research path (not Analyze).

### Why
Phase 2 explore P1s and Phase 12 study P0 asked for honest research notes. Empty ScholarXIV rows and an unwired Voxide widget on `main` stay accurate for judges.

## 2026-09-23 — In-process latency and error tracking

### Added
- `apps/server/src/ops/`: rolling API/AI/decision metrics (no profile text or transcripts).
- `GET /api/ops/summary` and `POST /api/ops/decision-debug`.
- `docs/architecture/observability.md`.

### Why
Phase 10/22 asked to track latency and errors without a production metrics vendor or logging sensitive content.

## 2026-09-23 — Kidist: Voxide widget on Ask HULUM

### Added
- `@voxide/react` on `/assistant` behind `NEXT_PUBLIC_VOXIDE_KEY` (`vox_pub_…`).
- One browser tool `runHulumAction` that calls the same `runTextAction` path as typed text and quick actions.
- Text/quick-action fallback StatusPanel when the public key is missing or invalid.
- Widget `setFallback`, `error`, and silence/timeout recovery that nudges back to typed Ask HULUM (same APIs).

### Why
ADR 001: Voxide is a browser widget. Gemini must not invent APPLY / MAYBE / SKIP; `decide()` stays on the server. No Express STT/TTS. Phase 12 asked for recognition failure and silence handling without killing the demo.

### Decision
Live Amharic STT is not claimed. English remains the stable path. Do not mark full voice DONE without a real mic test with a keyed widget.

## 2026-09-23 — CI: force-install Linux Tailwind Oxide after npm ci

### Fixed
- After `npm ci --include=optional`, CI explicitly installs `@tailwindcss/oxide-linux-x64-gnu@4.3.3` (and Lightning CSS / Rollup Linux bindings) so Ubuntu runners get the native packages even when npm’s os/cpu/libc filter skips them.
- Verify step asserts the Oxide and Lightning CSS Linux package directories exist before `require()`.
- `@hulum/web` lists the same Linux Oxide / Lightning CSS packages under `optionalDependencies`.

### Why
Lockfile and root `optionalDependencies` already recorded Oxide Linux, but Build web still failed with `Cannot find native binding` — optional install alone was not enough on the runner.

## 2026-09-23 — CI: record Linux Tailwind Oxide optional dependency

### Fixed
- Root `optionalDependencies` includes `@tailwindcss/oxide-linux-x64-gnu@4.3.3` so Ubuntu `npm ci --include=optional` can load `@tailwindcss/oxide` during `next build`.
- Pin `@tailwindcss/postcss` / `tailwindcss` to `4.3.3` in `apps/web`.
- CI verifies `require('@tailwindcss/oxide')` alongside Lightning CSS before Build web.

### Why
`next/font` triggers Tailwind v4 Oxide. The lockfile only recorded the Windows Oxide binary, so Build web failed after Lightning CSS was fixed.

## 2026-09-23 — CI: record Linux Lightning CSS optional dependency

### Fixed
- Root `optionalDependencies` includes `lightningcss-linux-x64-gnu@1.32.0` so Ubuntu `npm ci --include=optional` can load Tailwind’s Lightning CSS native binary during `next build`.
- CI verifies `require('lightningcss')` before the web build.

### Why
`next/font` + Tailwind need `lightningcss.linux-x64-gnu.node`. The lockfile was Windows-generated and only recorded `lightningcss-win32-*`, so Build web failed after typecheck/tests passed.

## 2026-09-23 — CI builds web and server

### Added
- GitHub Actions runs `npm run build:server` (`tsc`) and `npm run build` (Next.js) after tests.

### Why
Phase 24 asked for frontend and backend build gates. Typecheck alone does not prove `next build` or emit server JS.

## 2026-09-23 — Kidist: Ask HULUM profile gaps, clarify, repeat

### Added
- Text actions for profile completeness gaps and UNCERTAIN requirement clarification (stored analysis only).
- Assistant quick actions plus “Repeat that” / “ድገም” re-shows the last on-screen HULUM reply (no utterance storage).

### Why
Phase 12/18 asked for profile-gap and clarification asks, and repeat requests, without expanding the Task 22 intent enum or inventing requirements.

## 2026-09-23 — Explain evaluation fixtures and Groq retry

### Added
- `apps/server/src/ai/eval-examples.ts`: safe/unsafe Groq explanation fixtures checked against `sanitizeExplanation`.
- One `AI_ERROR` retry in `explain()` before falling back to the stored summary + next action.

### Why
Phase 10 asked for evaluation examples and retry/fallback. Unsafe model text must not change APPLY / MAYBE / SKIP or invent URLs.

## 2026-09-23 — Personalized readiness plan (AI wording)

### Added
- `POST /api/analyses/:id/readiness/plan` — Groq wording over the stored checklist; unsafe or inventing plans fall back to deterministic titles.
- Shared `ReadinessPlan` type; Ask HULUM text action and assistant quick action for personalized plans.
- Rate limit on readiness-plan posts (same limiter as explain).

### Why
Phase 10/11 asked for AI-personalized readiness without letting the model invent checklist items or change APPLY / MAYBE / SKIP.

## 2026-09-23 — Ask about profile gaps and uncertain requirements

### Added
- Ask HULUM (text + file-store voice) answers “What is missing from my profile?” using `profileCompleteness` without writing profile facts.
- “Clarify uncertain requirements” lists UNCERTAIN rows only and tells the user to confirm on the official source.
- Quick actions on `/assistant` for both prompts.

### Why
Phase 18 P1s asked for profile-gap and clarification asks. Reuses locked `UPDATE_PROFILE` / `SHOW_MISSING_REQUIREMENTS` with reply hints so the Task 22 intent set stays closed.

## 2026-09-23 — Requirement explanations in the analysis UI

### Changed
- Analysis requirement rows show a clear **Why** line (matcher `reason`) and **Evidence** when stored.

### Why
Phase 8 asked for requirement explanations. Matchers already produce `reason`; the analysis screen now surfaces them for users.

## 2026-09-23 — CI: Postgres service for vertical-slice tests

### Changed
- `.github/workflows/ci.yml` runs Postgres 16 (`hulum_test`), sets ephemeral job-level `DATABASE_URL`, migrates right after install, then typecheck/lint/`npm test`.
- `loadEnv` no longer overrides existing process env with `.env`, so the CI `DATABASE_URL` is not wiped when `apps/server/.env` is absent or empty.

### Why
`postgres-slice.test.ts` calls `getPool()` / `requireDatabaseUrl()` and needs a live schema. CI had neither Postgres nor `DATABASE_URL`. Credentials are workflow-only disposable values — not committed to `.env`.

## 2026-09-23 — CI: record Linux Rollup optional dependency

### Fixed
- `package-lock.json` now includes `@rollup/rollup-linux-x64-gnu` so Ubuntu `npm ci` / Vitest can resolve Rollup’s native binary.
- CI install uses `npm ci --include=optional`.

### Why
The lockfile was generated on Windows and only recorded `rollup-win32-*`. Job failure was missing `@rollup/rollup-linux-x64-gnu`, not a failing test assertion.

## 2026-09-23 — Lint, format tooling, and GitHub CI

### Added
- Flat ESLint (`eslint.config.mjs`) and Prettier (`.prettierrc.json`) with `npm run lint` / `format` / `format:check`.
- `.github/workflows/ci.yml` — install, typecheck shared/server, lint, test (no deploy, no format gate yet).

### Why
Phase 1 asked for linting, formatting, and CI checks. Format check stays a local script until a dedicated format pass; CI must not fail the whole tree on Prettier alone.

## 2026-09-23 — Decision audit trail

### Added
- `DecisionAudit` on `decide()` (`rulePath`, critical/uncertain keys, effective verification, advisory fit flag).
- Migration `003_analysis_decision_audit.sql` stores audit JSON on `analyses.decision_audit`.
- Analysis page “Decision audit (debug)” panel when audit is present.

### Why
Phase 9 asked for decision audit/debug information. Judges and teammates can see which engine branch produced APPLY / MAYBE / SKIP without treating fit score as a guarantee.

## 2026-09-23 — Conflicting facts stay UNCERTAIN on Postgres matcher

### Changed
- `requirements/match.ts` (Postgres / `decide()` path) now matches file-store conflict rules: field vs skills, years vs “no experience” text, in-progress education with a past graduation year → UNCERTAIN, not MET.

### Why
Phase 8 conflict handling must apply on both matchers. File-store already did; product analysis uses this matcher.

## 2026-09-22 — Mulualem

### Changed
Wired ScholarXIV Papers API to the website: `GET /api/research/papers` and `/research`. The server uses `SCHOLARXIV_API_KEY`. Papers stay research evidence.

### Why
Task 40 P1. Judges can search real papers without putting the key in the browser.

### Decision
ScholarXIV is not an opportunity source. `decide()` is unchanged.

## 2026-09-22 — Mulualem

### Changed
`npm run db:seed` loads the existing curated catalog into Postgres so the web can show official sourced cards (including one internship) while the investigator still refuses to invent rows.

### Why
HETRIIL internship HTML has no public deadline. The frontend was empty.

### Decision
Curated catalog and investigator stay separate. Investigator still does not invent listings.

## 2026-09-22 — Mulualem

### Changed
Investigator extract follow-up: Groq `gpt-oss` calls use `reasoning_effort=low` and a larger completion budget so extract is not cut off mid-thought. Official HTML may follow a few same-domain listing links. Invalid JSON extract becomes zero rows, not a hard fail.

### Why
A live run checked four pages and saved zero rows. Groq returned empty or unavailable replies. HETRIIL listings are not on the homepage.

### Decision
Still no invented listings. Aggregators stay leads. `hetriil.moe.gov.et` stays the official domain.

## 2026-09-22 — Mulualem

### Changed
Closed Task 48. Evidence and official-domain rules are tested. The opportunity card shows “AI-extracted, not yet verified”. Job API still waits for a documented URL.

### Why
Finish the investigator on Mulualem’s side without blocking on Kidist.

## 2026-09-22 — Mulualem

### Changed
Started Task 48: `sources` and `official_domains` tables, demo lead sites, `JOB_OPPORTUNITIES_API_KEY` / `JOB_OPPORTUNITIES_API_URL` names, and `POST /api/investigate`. Groq extracts; evidence must appear on the page. The job API is not called until its URL is documented.

### Why
The team locked automatic discovery. Developers add a source row instead of hardcoding sites.

### Decision
Aggregator hosts stay leads. `hetriil.moe.gov.et` is the first official domain. `decide()` still owns APPLY / MAYBE / SKIP.

## 2026-09-22 — Mulualem

### Changed
Marked Task 36 DONE. The Postgres slice test, web profile/analysis/Ask HULUM path, and Next.js `.js` resolve are already on `main`.

### Why
The integration verify is the real API plus persisted data, not the file-store flow test.

### Evidence
`apps/server/src/routes/postgres-slice.test.ts` on `main`. Web calls that API (PR merge `848fe27`). Next.js loads `@hulum/shared` (PR #18). Voice stays text.

### Decision
No Voxide backend. Task 32 stays skipped.

## 2026-09-20 — Conflicting profile facts stay UNCERTAIN

### Changed
- File-store matcher no longer treats mixed signals as MET: field of study vs skills/interests, years vs “no experience” text, and in-progress education with a past graduation year.

### Why
Phase 8 required handling conflicting information. Guessing MET from one fact while another fact contradicts it would hide a MAYBE.

## 2026-09-21 — Mulualem

### Changed
Pointed the web profile, opportunity list, analysis, and Ask HULUM screens at the Postgres API. Text actions call analyze, explain, readiness, and opportunity reads. Voice stays unavailable.

### Why
The UI still spoke the file-store shapes after `npm run dev` switched to Postgres.

## 2026-09-21 — Mulualem

### Changed
Added a Postgres integration test for profile → opportunity → `decide()` → readiness, and checked that explain does not change the stored decision.

### Why
Task 36 asks the core slice to use real services and persisted data. The older flow test still uses the JSON file store.

### Evidence
`apps/server/src/routes/postgres-slice.test.ts` passed against the local database. The fixture opportunity is deleted after the test.

### Decision
Voice stays a browser widget. This test does not add a Voxide backend.

## 2026-09-21 — Shared exports and Postgres dev runtime

### Changed
- `@hulum/shared` relative imports use `.js` so `typecheck:shared` passes under NodeNext.
- `npm run dev` boots Postgres (`decide.ts`) on API port **3001**; web defaults to `http://localhost:3001`. File-store remains available via `createApp({ store: "file" })` for tests.

### Why
After merging the Kidist demo next to Mulualem’s API, the product needed one coherent typecheck path and one web→API runtime (ADR 001).

## 2026-09-20 — Merge Kidist `feat/ci-checks` into main

### Changed
Merged the stacked Kidist web/file-store demo onto `main` after Mulualem PRs #11–#16. Default `npm run dev` is still the JSON file store. Postgres + Groq stay available via `createApp({ store: "postgres" })`.

### Why
Judges need the Next.js demo on `main` without dropping Groq, verification, or API security.

## 2026-09-20 — Mulualem

### Changed
Wrote the team problem lock: HULUM is decision and readiness, not another opportunity feed.

### Why
Task 39 needs one page both teammates can use with judges, without claiming we are the official organization.

### Evidence
Branch: `docs/problem-definition`

### Decision
Discovery already exists. HULUM answers eligible / worth it / missing / next step, then points at the official source.

## 2026-09-20 — Mulualem

### Changed
Recorded the v0.1 stack ADR: Next.js, Express, Postgres, deterministic decisions, Groq explain, Voxide in the browser.

### Why
Task 42 must make tech choices traceable and correct the SRS where Claude/Voxide-as-server-STT were wrong.

### Evidence
Branch: `docs/architecture-decisions`

### Decision
Groq explains; `decide()` owns APPLY/MAYBE/SKIP. Voxide is a frontend widget. ScholarXIV is research only. React Native waits.

## 2026-09-20 — Mulualem

### Changed
Added API CORS, secret redaction in errors, invalid-JSON handling, and a rate limit on explain.

### Why
Task 35 must reject bad requests and keep keys out of responses and Git.

### Evidence
Branch: `feat/api-security`

### Decision
CORS uses CLIENT_URL (local web origin if unset, none in production). Full auth waits. Explain is limited to 10 requests per IP per minute.

## 2026-09-20 — Mulualem

### Changed
Added official-source priority, effective VERIFIED / NEEDS_REVIEW / EXPIRED status, and the locked HULUM-is-not-the-organization notice on new analyses.

### Why
Task 34 must keep APPLY/MAYBE/SKIP as HULUM's reading, never the official eligibility or deadline.

### Evidence
Branch: `feat/opportunity-verification`

### Decision
Compute verification on read (30-day stale window). Do not rewrite stored rows. `sourceUrl` is fact authority; `applicationUrl` is apply-only. Expired listings cannot be APPLY.

## 2026-09-20 — Mulualem

### Changed
Added Groq explanation guards. Empty, JSON, invented URLs, or a contradictory APPLY/MAYBE/SKIP word are replaced with the stored summary.

### Why
Task 31 must not show a model reply that fights the engine decision.

### Evidence
Branch: `feat/ai-output-validation`

### Decision
Replace unsafe Groq text; do not 502 the user. Decision, fitScore, and nextAction still come only from the stored analysis.

## 2026-09-20 — Mulualem

### Changed
Added Groq explanation for a stored analysis. The API always returns the engine decision.

### Why
Task 30 needs plain-language explanation without Claude. Groq is the team lock for cost.

### Evidence
Branch: `feat/claude-orchestration`

### Decision
GROQ_API_KEY and GROQ_MODEL live in env. Groq never writes APPLY/MAYBE/SKIP. Default example model is openai/gpt-oss-20b (Groq replacement after Llama 3.3 shutdown).

## 2026-09-19 — Honest development narrative for STARK

### Added
- `docs/stark/narrative.md`: how Kidist and Mulualem actually built v0.1, including two runtimes and empty ScholarXIV.

### Why
Phase 27 required a final development narrative. It must match git, not the original pitch stack.

## 2026-09-19 — Voice gaps uses SHOW_MISSING_REQUIREMENTS

### Changed
- Parser and Ask HULUM emit Task 22 `SHOW_MISSING_REQUIREMENTS` instead of `SHOW_GAPS`. `UNSUPPORTED` stays a runtime fallback.

### Why
Day 20 freeze: final bug fixes only. The lock on `main` and the running demo must use the same intent name.

## 2026-09-19 — STARK submission cover for judges

### Added
- `docs/stark/README.md`: reading order, how to run, and an explicit list of what is not claimed (papers, deploy, live voice, `main` as the full product).

### Why
Day 20 required a final STARK submission package a judge can open without invented evidence.

## 2026-09-19 — Demo script rehearsed against tests (no fake live run)

### Added
- `docs/demo/rehearsal.md`: Day 20 check of the Abeba walkthrough against UI copy and `npm test` (APPLY / MAYBE / SKIP / text-fallback). No browser click-through or video is claimed.

### Why
Day 20 required a final demo rehearsal. The script must still match the file-store product.

## 2026-09-19 — Day 20 final changelog (no rewrite)

### Added
- `docs/stark/changelog-final.md`: freeze pass of `CHANGELOG.md` against git through Mulualem PR #10. Historical entries were not rewritten. File-store demo vs Postgres services stays explicit.

### Why
Day 20 required a final changelog. STARK tracking must still match the repository.

## 2026-09-19 — Git history reviewed (branches, not a rewrite)

### Added
- `docs/stark/git-history.md`: `main` has Mulualem PRs #1–#10; Kidist product work is still on stacked `feat/*`. No Cursor co-author on recent Kidist commits. History was not rewritten.

### Why
Day 20 required a final Git history review. Judges should not treat `main` as the full product.

## 2026-09-19 — Day 20 task status (no new features)

### Changed
- `task.md` / `HULUM_task.md` checkboxes match the running product and tests. Voxide, deploy, ScholarXIV papers, and an un-run browser pass stay open.
- `docs/stark/task-status.md` records what was marked and what was left open.

### Why
Day 20 required a final task status. Stale empty boxes were more misleading than the code.

## 2026-09-19 — Mulualem

### Changed
Added a deterministic readiness checklist from missing and document requirements, plus PATCH status.

### Why
Task 29 needs a stored checklist after analysis, before Claude explanation.

### Evidence
Branch: `feat/readiness-engine`

### Decision
Generation writes TODO and NOT_REQUIRED only. IN_PROGRESS and DONE come from PATCH. Claude does not create checklist items.

## 2026-09-19 — Mulualem

### Changed
Added POST analyze and GET analysis/readiness endpoints that persist the deterministic decision.

### Why
Task 28 needs one request to produce a stored HULUM analysis before Claude or readiness generation.

### Evidence
Branch: `feat/analysis-api`

### Decision
Analyze body is `{ userId }`. nextAction is derived from the stored decision. GET readiness returns stored items and stays empty until Task 29. Claude does not run on analyze.

## 2026-09-19 — Mulualem

### Changed
Added the APPLY/MAYBE/SKIP engine and automated cases for critical mismatch, complete match, and uncertainty.

### Why
Tasks 26–27 need a deterministic decision and score before the analysis API.

### Evidence
Branch: `feat/decision-engine`

### Decision
Critical keys are country, education, and deadline. Key keys add field and language. Fit-score weights are named constants. Claude does not set the decision.

## 2026-09-19 — Mulualem

### Changed
Added deterministic requirement matching with MET, NOT_MET, UNCERTAIN, and NOT_APPLICABLE.

### Why
Task 25 needs auditable profile-vs-opportunity statuses before APPLY/MAYBE/SKIP.

### Evidence
Branch: `feat/requirement-matching`

### Decision
Exact normalized list membership only. Unstructured experience/documents stay UNCERTAIN. Deadline uses an injected clock. Never guess MET.

## 2026-09-19 — Mulualem

### Changed
Added profile create, read, and update APIs with completeness handling.

### Why
Task 24 needs a persisted profile the decision engine can read.

### Evidence
Branch: `feat/profile-service`

### Decision
Full auth waits. POST /api/profile creates a users row plus a profiles row. Completeness lists empty analysis fields.

## 2026-09-19 — Mulualem

### Changed
Added `GET /api/opportunities` and `GET /api/opportunities/:id` with structured requirements and official source fields.

### Why
Task 23 needs a real opportunity API before the browse UI and analysis can use catalog data.

### Evidence
Branch: `feat/opportunity-service`

### Decision
No invented seed opportunities. The list may be empty until official rows are inserted.

## 2026-09-19 — Mulualem

### Changed
Added `@hulum/shared` contracts and switched the server envelope to import them.

### Why
Web, mobile, and server must use one Profile, Opportunity, Analysis, and voice-intent contract.

### Evidence
Branch: `feat/shared-contracts`

### Decision
Voice intents are the locked 9 names. `SHOW_GAPS` is not a contract value; use `SHOW_MISSING_REQUIREMENTS`.

## 2026-09-19 — Mulualem

### Changed
Added PostgreSQL v1 schema, migration runner, and rollback smoke insert/select.

### Why
Task 21 needs durable tables for profiles, opportunities, analyses, and readiness before API services.

### Evidence
Branch: `feat/database-schema`

### Decision
Locked Build Spec §20 table names. Assignments `requirements` is `requirement_results`. Auth RLS policies wait for Task 35.

## 2026-09-19 — Backup demo path without a fake video

### Added
- `docs/demo/backup.md`: 3-minute text path, Analyze-failure path, and API-only path for Abeba Tesfaye. No screenshot pack or recorded video is claimed.

### Why
Day 19 required a backup demo. Voxide and a production host are still missing.

## 2026-09-19 — Changelog reviewed against git (no rewrite)

### Added
- `docs/stark/changelog-review.md`: Day 19 pass of `CHANGELOG.md` against `git log`. Historical entries were not rewritten. Missing PR numbers and screenshots were not invented.

### Why
Day 19 required a changelog review. STARK tracking must match the repository.

## 2026-09-19 — Architecture overview matches the running API

### Changed
- `docs/architecture/overview.md`: Analyze and voice share `runAnalysis`, production CORS, validated Claude, ADR 004. ADR 003 no longer says Analyze is UI-only.

### Why
Day 19 required an architecture review against the code.

## 2026-09-19 — README matches the running v0.1 product

### Changed
- README no longer treats Supabase, Voxide, ScholarXIV, or EthioDeploy as live. It describes the file store, text/quick-action voice, optional Claude, and local demo.

### Why
Day 19 required a README review against the code, not the original pitch stack.

## 2026-09-19 — STARK evidence index (honest gaps included)

### Added
- `docs/stark/evidence.md` maps problem, ideation, ADRs, demo, changelog, and GitHub to files. ScholarXIV papers, production deploy, and Voxide stay listed as gaps.

### Why
Day 19 required STARK documentation a judge can follow without invented research or a fake host.

## 2026-09-19 — STARK demo script for Abeba Tesfaye

### Added
- `docs/demo/script.md`: timed walkthrough (Abeba → A2SV APPLY, optional UCT MAYBE / Chevening SKIP), text backup instead of live voice, and what not to claim.

### Why
Day 19 required a demo script that matches the running product.

## 2026-09-19 — Assistant backup mode when Voxide is missing

### Added
- Ask HULUM shows Voice unavailable from the session provider (or a failed session create), keeps text + quick actions, and offers Type a request or Browse opportunities.

### Why
Phase 21 required a usable product when voice fails. Microphone STT is still unwired.

## 2026-09-19 — Failure paths keep APPLY/MAYBE/SKIP from the engine

### Added
- API tests: UCT MAYBE (uncertain), Chevening SKIP (not met), expired A2SV SKIP, Voxide missing → text-fallback.
- Claude timeout uses the engine summary instead of failing Analyze.

### Why
Days 17–18 required failure testing. Microphone and live Voxide STT stay blocked.

## 2026-09-19 — Analysis keeps an official source link and the responsible-AI notice

### Added
- Analysis screen: Apply officially, Official source, disclaimer notice. External links use `noopener noreferrer`.
- Integration test: stored analysis includes `sourceUrl`, `applicationUrl`, and the official-organization disclaimer.

### Why
Days 17–18 required E2E coverage of the official source path. Deploy is still blocked without a host. Voice E2E is the text-fallback loop (ADR 003).

## 2026-09-19 — Production env refuses to start without a CORS origin

### Added
- `loadEnv` requires `CLIENT_URL` as an http(s) origin when `NODE_ENV=production`. Default API port is 4000.
- README lists required vs optional host variables. Claude, Voxide, and Supabase stay optional; the file store is still the default.

### Why
Days 15–16 required production configuration. This is not a live deploy.

## 2026-09-19 — API security pass: keys stay off the wire

### Added
- Security headers (`nosniff`, `DENY` framing, `no-store`) and production CORS that does not default to localhost.
- Tests: Claude/Voxide keys and voice transcripts must not appear in health, session, or 404 bodies.

### Why
Days 15–16 required a security review of the running API. Full login is still P1; v0.1 uses a local `userId`.

## 2026-09-19 — API failures stay in the `{ data, error }` envelope

### Added
- Express error handler for invalid JSON and oversized bodies, without leaking parser internals.
- Tests: unknown route/opportunity/analysis, analyze without userId or profile, invalid voice body, unsupported utterance.

### Why
Days 15–16 required error handling against the real API.

## 2026-09-19 — Full voice flow is covered through the text-fallback API

### Added
- Integration test: session, internships, current opportunity, analyze A2SV, why, gaps, readiness, then APPLY filter without extra stored analyses.

### Changed
- File store reads `STORE_PATH` when loading or saving, so tests can isolate `store.json`.

### Why
Days 15–16 required the full voice flow against the real API. Voxide is still unwired (ADR 003).

## 2026-09-19 — Analysis → readiness is covered through the API

### Added
- Integration test: Analyze A2SV, GET the stored checklist, PATCH an item to DONE, then confirm the status persists.

### Why
Days 15–16 required the full analysis → readiness flow against the real API.

## 2026-09-19 — Profile → opportunity → analysis is covered through the API

### Added
- Integration test: demo profile, sourced A2SV record, Analyze, then GET the stored APPLY/MAYBE/SKIP result.

### Why
Days 15–16 required the full profile → opportunity → analysis flow against the real API.

## 2026-09-19 — Assistant describes the current opportunity from stored facts

### Added
- “Tell me about this opportunity” uses the selected stored record: title, type, deadline, official source, and the saved APPLY/MAYBE/SKIP if one exists.
- Without a selected opportunity, HULUM asks the user to choose one instead of opening the first catalog item.

### Why
Days 13–14 required a contextual assistant grounded in HULUM, not a free chatbot.

## 2026-09-19 — Claude JSON is validated before it reaches the user

### Added
- Claude must return `{ decision, explanation }`. Invalid JSON, a different APPLY/MAYBE/SKIP, official-eligibility claims, or erased uncertainty are replaced with the engine summary.

### Why
Task 31 / Days 13–14 required structured AI output validation. The engine decision is not changed.

## 2026-09-19 — Claude may only rephrase the engine decision

### Added
- Explanation service uses `CLAUDE_API_KEY` / `CLAUDE_MODEL` (or the Anthropic aliases). Missing key or model keeps the engine summary.
- Claude text that names a different APPLY / MAYBE / SKIP is discarded.
- Tests cover no-key fallback and contradictory wording.

### Why
Days 13–14 required Claude explanation. The deterministic engine remains the source of truth.

## 2026-09-19 — English is the stable v0.1 language end-to-end

### Added
- Language selector on profile and assistant using existing `en` / `am` / `om` codes. Changing language restarts the voice session.
- English integration test: session → internships → analyze A2SV → why → missing → prepare.
- ADR 004: English is the stable path; Amharic/Oromo are stored for Voxide and are not claimed as live speech.

### Why
Days 10–12 required one stable language end-to-end. Voxide is still not live.

## 2026-09-18 — Voice intent mapping covers documented utterances

### Added
- Unit tests for `parseVoiceIntent` against the Phase 12 examples plus Amharic keywords already in the parser.
- Confirms “Should I apply for this?” stays analyze, while “Show me opportunities I should apply for” stays APPLY catalog filter.

### Why
Days 10–12 required voice intent mapping. No new intents. Voxide is still not live.

## 2026-09-18 — Voice session is persisted without transcripts

### Added
- `POST /api/voice/session` stores id, user, language, and start time in the file store. Utterance text is not saved.
- The assistant starts that session on load and shows whether Voxide or text-fallback is active.

### Why
Days 10–12 required a voice session. Voxide is still not live; the session is the same text-fallback path as ADR 003.

## 2026-09-18 — Voice filters opportunities by APPLY / MAYBE / SKIP

### Added
- `FILTER_BY_DECISION` scores the catalog with the same engine as Analyze and lists matching opportunities. Those scores are not stored, so a later Why / missing / prepare still uses the last saved analysis.
- Test: “Show me opportunities I should apply for” is a catalog filter, not analyze-this. Chevening stays in SKIP, not APPLY.

### Why
Days 10–12 required voice filter/show by decision. Voxide is still not live.

## 2026-09-18 — Voice gaps uses stored NOT_MET / UNCERTAIN requirements

### Added
- `SHOW_GAPS` loads the latest analysis for the user/opportunity and replies with stored missing or uncertain requirements.
- Test: analyze Chevening, then “What am I missing?” returns those requirement texts and statuses.

### Why
Days 10–12 required voice → gaps after readiness. Voxide is still not live.

## 2026-09-18 — Voice readiness uses stored checklist

### Added
- `SHOW_READINESS` loads the latest analysis for the user/opportunity and replies with next action plus checklist titles and status.
- Test: analyze A2SV, then “What should I prepare?” returns stored readiness items.

### Why
Days 10–12 required voice → readiness after explanation. Voxide is still not live.

## 2026-09-18 — Voice explanation uses stored engine result

### Added
- `EXPLAIN_DECISION` loads the latest analysis for the user/opportunity if no analysis id is sent.
- Reply starts with APPLY/MAYBE/SKIP, then the stored explanation. The engine decision is not changed.
- Test: analyze A2SV, then “Why did you say that?” returns the same decision.

### Why
Days 10–12 required voice → explanation after voice → analysis. Voxide is still not live.

## 2026-09-18 — Voice analyze uses the decision engine

### Added
- Text/quick-action `ANALYZE_OPPORTUNITY` now calls the same `runAnalysis` path as the Analyze button.
- Assistant keeps the new analysis id so Why / missing / readiness can follow in the same session.
- Vitest coverage that the reply is APPLY/MAYBE/SKIP, not “click Analyze”.

### Why
Task 11/33: voice must trigger real HULUM actions. Voxide is still not connected.

### Decision
The deterministic engine remains the source of truth. No new voice intents.

## 2026-09-18 — Phase 4 accessibility

### Added
- Skip-to-content link, visible keyboard focus, and 44px touch targets on core controls.
- Decision labels, requirement status text plus edge marks, and official links announced as new tabs.
- Darker APPLY / MAYBE / SKIP and muted colors so meaning does not depend on color alone.

### Why
Phase 4 P1 required the main journey to stay usable with keyboard, contrast, and non-color cues.

## 2026-09-18 — Mulualem

### Changed
Added the Express + TypeScript backend scaffold, module folders, and `GET /api/health`.

### Why
Task 20 needs a running server, a health check, and a fixed place for later services without putting secrets in Git.

### Evidence
Branch: `feat/backend-scaffold`

### Decision
Backend tests use Vitest. Shared contracts stay in Task 22; the running server still uses the file-store vertical slice until Supabase is wired.

## 2026-09-18 — Phase 4 opportunity search

### Added
- Opportunity list search box combined with the existing type filter.
- `GET /api/opportunities?q=` matches title, organization, description, type, country, and field text.
- Empty-search recovery: clear search or clear filter.

### Why
Phase 4 P1 required list search so users can find a sourced record without scrolling the full catalog.

## 2026-09-18 — Phase 4 loading, empty, and error states

### Added
- Shared `StatusPanel` on profile, opportunities, analysis, and assistant.
- Retry / next-action paths for API, network, missing profile, empty lists, and missing records.
- Safer client fetch: connection failures no longer surface raw `Failed to fetch` text.

### Why
Phase 4 P1 required loading, empty, and failure UI with recovery, without exposing technical errors.

### Decision
Voice microphone failure is an honest “not connected” control. Voxide is still not live.

## 2026-09-18 — Architecture confirmation

### Added
- `docs/architecture/overview.md` — runtime as built (Next.js, Express, JSON store, engine).
- ADRs: file store before Supabase; engine as source of truth; text voice fallback until Voxide.

### Why
Days 1–2 required architecture confirmation before treating later phases as unblocked.

### Decision
Do not pretend Supabase or Voxide are live. Shared contracts stay in `packages/shared`.

## 2026-09-18 — Phase 3 competitive research

### Added
- `docs/research/competitive-analysis.md` — EthioScholarship, Fastweb, Bold.org, Scholly, Scholar Africa, and related channels, checked on public web.
- Unverified v0.1 spec names left off the judge-facing list.
- Voice-decision competitors: none verified this pass (not claimed as proof of uniqueness).

### Why
Phase 3 is P0. Differentiation is decision + readiness + voice + local language, not “AI matching.”

## 2026-09-18 — Kidist / Phase 2 ScholarXIV ideation space

### Added
- `docs/research/` — canonical ideation/research folder.
- `docs/research/ideation.md` — alternatives, rejected ideas, why HULUM was selected.
- `docs/research/scholarxiv.md` — query list and empty paper table (no fabricated citations).

### Why
STARK ideation needs a real trail. Papers and MCP/API calls have not been run yet and are marked blocked.

## 2026-09-18 — Kidist / Phase 1 product definition

### Added
- `docs/product/problem.md` — discovery vs decision, wasted applications, uncertainty, readiness, Ethiopian context, product gap.
- `docs/product/personas.md` — student, professional, guest, demo persona Abeba Tesfaye.
- `docs/product/research-questions.md` — Phase 1 questions with hypotheses; no fabricated papers.

### Why
`task.md` Phase 1 is Kidist P0 before ScholarXIV (Phase 2) and further UX polish.

### Decision
Working hypotheses are labeled as such. ScholarXIV evidence is explicitly deferred.

## 2026-09-18 — Kidist / Phase 4 product UX

### Added
- Canonical `team_assignments.md` and `git-workflow.md`.
- `docs/product/hulum-flow.md` mapping the task.md journey to live routes.
- Landing page that shows APPLY / MAYBE / SKIP meaning and the full user journey.

### Why
Kidist owns product/UX. Phase 4 requires the core journey to be visible before more frontend polish or voice work.

### Evidence
Branch `feat/web-product-ux`

## 2026-09-18 — Foundation

### Added
- Monorepo scaffold: Next.js web app, Express API, shared TypeScript contracts.
- Deterministic requirement matcher and APPLY / MAYBE / SKIP engine.
- Curated seed opportunities with official source URLs.
- First vertical slice: profile → opportunity → analysis → readiness → assistant fallback.

### Why
The locked v0.1 spec requires a working decision loop before voice polish or extra features.

### Decision
The decision engine is the source of truth. Claude, when configured, only explains structured results. Voice falls back to text if Voxide is unavailable.
