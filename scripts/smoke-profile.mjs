#!/usr/bin/env node
/**
 * Profile page end-to-end against the local stack (npm run db:migrate && npm run dev).
 * Registers a throwaway account, then walks every state through the real UI:
 * photo add/change, CV upload/update (one record, one action), edit + reload,
 * other documents add/update/view, documents load failure, light/dark, desktop/tablet/mobile.
 * Screenshots go to $TEMP/hulum-profile (or PROFILE_SMOKE_OUT).
 *
 *   npm run smoke:profile
 */

import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { chromium } from "playwright";

const API = process.env.API_URL ?? "http://localhost:3001";
const WEB = process.env.WEB_URL ?? "http://localhost:3000";
const OUT = process.env.PROFILE_SMOKE_OUT ?? `${tmpdir()}/hulum-profile`;
mkdirSync(OUT, { recursive: true });

async function call(path, init = {}, token) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(token ? { "X-Hulum-Session": token } : {}) },
  });
  const body = await res.json();
  if (!res.ok || body.error) throw new Error(`${path} ${res.status} ${JSON.stringify(body.error)}`);
  return body.data;
}

const { userId, sessionToken } = await call("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ name: "Kidist Kemal", email: `profile.${Date.now()}@example.invalid`, password: "strong-pass" }),
});
await call(
  `/api/profile/${userId}`,
  {
    method: "PATCH",
    body: JSON.stringify({
      educationLevel: "bachelor_in_progress",
      fieldOfStudy: "Computer Science",
      graduationYear: 2027,
      country: "Ethiopia",
      languages: ["English", "Amharic"],
      skills: ["Frontend Development", "React"],
      experience: "One software internship at a fintech startup in Addis Ababa.",
      interests: ["AI", "Scholarships"],
    }),
  },
  sessionToken,
);

let browser;
try {
  browser = await chromium.launch();
} catch {
  browser = await chromium.launch({ channel: "msedge" });
}

const results = [];
function check(name, ok, detail = "") {
  results.push(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function newPage(viewport = { width: 1440, height: 1000 }, theme = "light") {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(
    ([t, u, th]) => {
      localStorage.setItem("hulum.sessionToken", t);
      localStorage.setItem("hulum.userId", u);
      localStorage.setItem("hulum.theme", th);
    },
    [sessionToken, userId, theme],
  );
  const page = await context.newPage();
  return { context, page };
}

async function openProfile(page) {
  await page.goto(`${WEB}/profile`);
  await page.getByRole("heading", { name: "Your profile" }).waitFor({ timeout: 60000 });
  await page
    .locator('section[aria-labelledby="cv-heading"]')
    .getByRole("button", { name: /^(Upload CV|Update CV)$/ })
    .waitFor({ timeout: 60000 });
  await page.waitForTimeout(500);
}

async function imagePng(page, colors) {
  const p = await page.context().newPage();
  await p.setViewportSize({ width: 640, height: 480 });
  await p.setContent(
    `<div style="width:640px;height:480px;background:radial-gradient(circle at 40% 35%, ${colors[0]} 0 18%, ${colors[1]} 19% 45%, ${colors[2]} 46%)"></div>`,
  );
  const buffer = await p.screenshot();
  await p.close();
  return buffer;
}

const pdf = (title) =>
  Buffer.from(
    `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 300]>>endobj\ntrailer<</Root 1 0 R>>\n%${title}\n%%EOF\n`,
  );

async function choose(page, trigger, file) {
  const [chooser] = await Promise.all([page.waitForEvent("filechooser"), trigger.click()]);
  await chooser.setFiles(file);
}

const cvSection = (page) => page.locator('section[aria-labelledby="cv-heading"]');
const docsSection = (page) => page.locator('section[aria-labelledby="documents-heading"]');

const { context, page } = await newPage();
await openProfile(page);

// Empty states
const photoButton = page.getByRole("button", { name: /Add photo|Change photo/ });
check("no photo: shows Add photo", (await page.getByRole("button", { name: "Add photo" }).count()) === 1);
check("no photo: initials avatar", (await page.locator('img[alt^="Profile photo of"]').count()) === 0);
check("no CV: Upload CV visible", (await cvSection(page).getByRole("button", { name: "Upload CV" }).count()) === 1);
check("no CV: Update CV absent", (await cvSection(page).getByRole("button", { name: "Update CV" }).count()) === 0);
check("no CV: empty text", await cvSection(page).getByText("No CV uploaded yet.").isVisible());
check("no docs: empty text", await docsSection(page).getByText("No supporting documents yet.").isVisible());
check(
  "completeness from existing logic (city missing)",
  (await page.getByRole("progressbar").getAttribute("aria-valuenow")) === "89",
  `aria-valuenow=${await page.getByRole("progressbar").getAttribute("aria-valuenow")}`,
);
const sidebarActive = await page.locator('aside button[aria-haspopup="menu"]').getAttribute("class");
check("sidebar account button highlighted on /profile", sidebarActive.includes("bg-surface-muted"));
const mainWidth = await page.locator("main").evaluate((el) => el.getBoundingClientRect().width);
check("main content is wider than before (≤1152)", mainWidth > 1024 && mainWidth <= 1152, `${mainWidth}px`);
await page.screenshot({ path: `${OUT}/01-empty-desktop-light.png`, fullPage: true });

// Bad CV file
await choose(page, cvSection(page).getByRole("button", { name: "Upload CV" }), {
  name: "notes.txt",
  mimeType: "text/plain",
  buffer: Buffer.from("hello"),
});
check(
  "invalid CV shows a clear error",
  await cvSection(page).getByText("Please upload your CV as a PDF").isVisible(),
);

// Photo upload
await choose(page, page.getByRole("button", { name: "Add photo" }), {
  name: "me.png",
  mimeType: "image/png",
  buffer: await imagePng(page, ["#e9dcc4", "#8a6a45", "#2b2620"]),
});
await page.getByText("Profile photo updated.").waitFor({ timeout: 20000 });
check("photo upload: success message", true);
await openProfile(page);
const img = page.locator('img[alt^="Profile photo of"]');
await img.waitFor({ timeout: 10000 });
check("photo persists after reload", (await img.evaluate((el) => el.naturalWidth)) > 0);
check("photo exists: Change photo, no Add photo", (await page.getByRole("button", { name: "Add photo" }).count()) === 0 && (await page.getByRole("button", { name: "Change photo" }).count()) === 1);
const before = (await call(`/api/profile/${userId}`, {}, sessionToken)).photoUpdatedAt;
await choose(page, page.getByRole("button", { name: "Change photo" }), {
  name: "me2.png",
  mimeType: "image/png",
  buffer: await imagePng(page, ["#f2efe8", "#4b4a46", "#151514"]),
});
await page.getByText("Profile photo updated.").waitFor({ timeout: 20000 });
await openProfile(page);
const after = (await call(`/api/profile/${userId}`, {}, sessionToken)).photoUpdatedAt;
check("change photo persists (new timestamp)", before && after && after > before, `${before} -> ${after}`);
check("changed photo shown after reload", (await page.locator('img[alt^="Profile photo of"]').evaluate((el) => el.naturalWidth)) > 0);

// CV upload, reload, update
await choose(page, cvSection(page).getByRole("button", { name: "Upload CV" }), {
  name: "Kidist_Kemal_CV.pdf",
  mimeType: "application/pdf",
  buffer: pdf("v1"),
});
await cvSection(page).getByText("CV uploaded successfully.").waitFor({ timeout: 20000 });
await openProfile(page);
check("CV persists: filename shown", await cvSection(page).getByText("Kidist_Kemal_CV.pdf").isVisible());
check("CV exists: Upload CV gone", (await page.getByRole("button", { name: "Upload CV" }).count()) === 0);
check("CV exists: exactly one Update CV", (await page.getByRole("button", { name: "Update CV" }).count()) === 1);
check("CV exists: View present", (await cvSection(page).getByRole("button", { name: "View" }).count()) === 1);
await choose(page, cvSection(page).getByRole("button", { name: "Update CV" }), {
  name: "Kidist_Kemal_CV_2026.pdf",
  mimeType: "application/pdf",
  buffer: pdf("v2"),
});
await cvSection(page).getByText("CV updated successfully.").waitFor({ timeout: 20000 });
await openProfile(page);
check("updated CV shown after reload", await cvSection(page).getByText("Kidist_Kemal_CV_2026.pdf").isVisible());
check("old CV name gone", (await page.getByText("Kidist_Kemal_CV.pdf", { exact: true }).count()) === 0);
const docsNow = await call(`/api/profile/${userId}/documents`, {}, sessionToken);
check("exactly one CV record (replaced, not duplicated)", docsNow.filter((d) => d.label === "CV").length === 1, `${docsNow.length} docs`);
const [popup] = await Promise.all([
  page.waitForEvent("popup", { timeout: 15000 }),
  cvSection(page).getByRole("button", { name: "View" }).click(),
]);
await popup.waitForURL(/^blob:/, { timeout: 15000 }).catch(() => undefined);
check("View CV opens the file", popup.url().startsWith("blob:"), popup.url().slice(0, 30));
await popup.close();

// Edit profile + add missing details focus
await page.getByRole("button", { name: "Add missing details" }).click();
await page.waitForTimeout(300);
check("Add missing details focuses the missing field", (await page.evaluate(() => document.activeElement?.id)) === "profile-city");
await page.locator("#profile-city").fill("Addis Ababa");
await page.locator("#profile-skills").fill("Frontend Development, React, TypeScript");
await page.screenshot({ path: `${OUT}/05-edit-desktop-light.png`, fullPage: true });
await page.getByRole("button", { name: "Save profile" }).click();
await page.getByText("Profile updated successfully.").waitFor({ timeout: 20000 });
await openProfile(page);
check("edit persists: TypeScript chip after reload", await page.locator("li", { hasText: /^TypeScript$/ }).isVisible());
check("edit persists: 100% after city added", (await page.getByRole("progressbar").getAttribute("aria-valuenow")) === "100");

// Documents: add, persist, update, view, remove
const addForm = docsSection(page).locator("form");
await addForm.getByLabel("Document name").fill("Transcript");
await addForm.locator('input[type="file"]').setInputFiles({ name: "transcript-scan.png", mimeType: "image/png", buffer: await imagePng(page, ["#ffffff", "#dddddd", "#bbbbbb"]) });
await addForm.getByRole("button", { name: "Add document" }).click();
await docsSection(page).getByText("Transcript added.").waitFor({ timeout: 30000 });
await addForm.getByLabel("Document name").fill("Certificate");
await addForm.locator('input[type="file"]').setInputFiles({ name: "certificate.pdf", mimeType: "application/pdf", buffer: pdf("cert") });
await addForm.getByRole("button", { name: "Add document" }).click();
await docsSection(page).getByText("Certificate added.").waitFor({ timeout: 30000 });
await openProfile(page);
check("documents persist after reload", (await docsSection(page).locator("li").count()) === 2);
const transcriptRow = docsSection(page).locator("li", { hasText: "Transcript" });
await choose(page, transcriptRow.getByRole("button", { name: "Update" }), { name: "transcript-official.pdf", mimeType: "application/pdf", buffer: pdf("tr2") });
await docsSection(page).getByText("Transcript updated.").waitFor({ timeout: 30000 });
await openProfile(page);
check("document update persists (new file name, same label)", await docsSection(page).getByText(/transcript-official\.pdf/).isVisible());
check("document update did not duplicate", (await docsSection(page).locator("li").count()) === 2);
const [docPopup] = await Promise.all([
  page.waitForEvent("popup", { timeout: 15000 }),
  docsSection(page).locator("li", { hasText: "Certificate" }).getByRole("button", { name: "View" }).click(),
]);
await docPopup.waitForURL(/^blob:/, { timeout: 15000 }).catch(() => undefined);
check("document View opens the file", docPopup.url().startsWith("blob:"));
await docPopup.close();
await page.screenshot({ path: `${OUT}/02-filled-desktop-light.png`, fullPage: true });
await context.close();

// Themes and sizes
for (const [name, viewport, theme] of [
  ["03-filled-desktop-dark", { width: 1440, height: 1000 }, "dark"],
  ["04-filled-tablet-light", { width: 820, height: 1180 }, "light"],
  ["06-filled-mobile-light", { width: 390, height: 844 }, "light"],
  ["07-filled-mobile-dark", { width: 390, height: 844 }, "dark"],
]) {
  const { context: c, page: p } = await newPage(viewport, theme);
  await openProfile(p);
  await p.locator('img[alt^="Profile photo of"]').waitFor({ timeout: 10000 });
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${name}: no horizontal scroll`, overflow <= 0, `overflow ${overflow}px`);
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  await c.close();
}

// Documents request fails: no false "Upload CV"
{
  const { context: c, page: p } = await newPage();
  await p.route(/\/api\/profile\/[^/]+\/documents$/, (route) => route.abort());
  await p.goto(`${WEB}/profile`);
  await p.getByText("We couldn't load your CV and documents.").waitFor({ timeout: 60000 });
  check(
    "documents load failure: retry shown, no Upload/Update CV",
    (await p.getByRole("button", { name: "Try again" }).count()) === 1 &&
      (await p.getByRole("button", { name: /Upload CV|Update CV/ }).count()) === 0,
  );
  await p.unroute(/\/api\/profile\/[^/]+\/documents$/);
  await p.getByRole("button", { name: "Try again" }).click();
  await p.getByRole("button", { name: "Update CV" }).waitFor({ timeout: 30000 });
  check("documents retry recovers the CV", true);
  await c.close();
}

// Remove CV returns to the Upload state (then re-check UI logic)
const { context: c2, page: p2 } = await newPage();
await openProfile(p2);
await cvSection(p2).getByRole("button", { name: "Remove" }).click();
await cvSection(p2).getByText("CV removed.").waitFor({ timeout: 15000 });
await openProfile(p2);
check("after removing CV: Upload CV again, no Update CV", (await p2.getByRole("button", { name: "Upload CV" }).count()) === 1 && (await p2.getByRole("button", { name: "Update CV" }).count()) === 0);
await c2.close();

await browser.close();
console.log(results.join("\n"));
console.log(`screenshots: ${OUT}`);
if (results.some((line) => line.startsWith("FAIL"))) process.exit(1);
