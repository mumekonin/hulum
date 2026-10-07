#!/usr/bin/env node
/**
 * Capture Phase 25 backup demo PNGs into docs/demo/screenshots/.
 * Local stack only — not production, not mic, not a recorded video.
 *
 *   INVESTIGATE_WORKER=false npm run dev
 *   npm run capture:demo-screenshots
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const WEB = process.env.WEB_URL ?? "http://localhost:3000";
const timeout = 60_000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "docs", "demo", "screenshots");

async function assertOk(response, label) {
  if (!response.ok()) {
    const body = await response.text().catch(() => "");
    throw new Error(`${label} failed: ${response.status()} ${body.slice(0, 500)}`);
  }
}

async function shot(page, name) {
  const file = path.join(outDir, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`wrote ${path.relative(process.cwd(), file)}`);
}

async function saveOnboardingStep(page, label) {
  const savePromise = page.waitForResponse((response) => {
    const method = response.request().method();
    if (method !== "POST" && method !== "PATCH") return false;
    try {
      return /\/api\/profile(\/|$)/.test(new URL(response.url()).pathname);
    } catch {
      return false;
    }
  });
  await page.getByRole("button", { name: /^Continue$/ }).click();
  await assertOk(await savePromise, label);
}

async function analyzeAndShot(page) {
  const analyzePromise = page.waitForResponse((response) => {
    if (response.request().method() !== "POST") return false;
    try {
      return /\/api\/opportunities\/[^/]+\/analyze$/.test(new URL(response.url()).pathname);
    } catch {
      return false;
    }
  });
  await page.getByRole("button", { name: "Analyze my fit" }).click();
  await assertOk(await analyzePromise, "Analyze");
  await page.getByRole("heading", { name: "HULUM decision" }).waitFor();
  await page.getByLabel(/Decision (APPLY|MAYBE|SKIP)\./).waitFor();
  await shot(page, "04-analysis.png");
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const email = `demo.shots.${String(Date.now())}@example.invalid`;
  console.log(`capture:demo-screenshots → ${WEB} (${email})`);

  const browser = await chromium
    .launch({ headless: true, channel: "msedge" })
    .catch(() => chromium.launch({ headless: true, channel: "chrome" }))
    .catch(() => chromium.launch({ headless: true }));
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(timeout);

  try {
    await page.goto(`${WEB}/sign-in`, { waitUntil: "domcontentloaded" });
    await page.getByText("HULUM", { exact: true }).first().waitFor();
    await shot(page, "01-gateway.png");

    await page.getByRole("link", { name: /Create account/i }).click();
    await page.waitForURL(/\/verify/);
    await page.locator("#register-name").fill("Abeba Tesfaye");
    await page.locator("#register-email").fill(email);
    await page.locator("#register-password").fill("strong-pass");
    const registerPromise = page.waitForResponse((response) => {
      if (response.request().method() !== "POST") return false;
      try {
        return new URL(response.url()).pathname === "/api/auth/register";
      } catch {
        return false;
      }
    });
    await page.getByRole("button", { name: /Create account/i }).click();
    await assertOk(await registerPromise, "Register");
    await page.waitForURL(/\/onboarding/);

    await page.locator("#onboarding-country").waitFor({ timeout: 90_000 });
    await page.locator("#onboarding-country").fill("Ethiopia");
    await page.locator("#onboarding-city").fill("Addis Ababa");
    await saveOnboardingStep(page, "Onboarding: about you");

    await page.getByRole("heading", { name: /Education/i }).waitFor();
    await page.locator("#onboarding-education").selectOption("bachelor_in_progress");
    await page.locator("#onboarding-field").fill("Computer Science");
    await page.locator("#onboarding-graduation").fill("2027");
    await saveOnboardingStep(page, "Onboarding: education");

    await page.getByRole("heading", { name: /Skills and experience/i }).waitFor();
    await page.locator("#onboarding-languages").fill("English, Amharic");
    await page.locator("#onboarding-skills").fill("Python, React");
    await page.locator("#onboarding-experience").fill("One software internship.");
    await page.locator("#onboarding-interests").fill("AI, scholarships");
    await saveOnboardingStep(page, "Onboarding: skills");

    await page.getByRole("heading", { name: /Your CV/i }).waitFor();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByRole("link", { name: /Review profile/i }).waitFor();
    await page.getByRole("link", { name: /Review profile/i }).click();
    await page.waitForURL(/\/profile/);
    await page.getByRole("heading", { name: /Your profile/i }).waitFor();
    await page.getByText("Abeba Tesfaye").first().waitFor();
    await page.getByText(/Computer Science/i).first().waitFor();
    await shot(page, "02-profile.png");

    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Discover", exact: true })
      .click();
    await page.waitForURL(/\/opportunities/);
    await page.getByRole("heading", { name: /Find opportunities worth your time/i }).waitFor();
    await page.getByText("Loading opportunities").waitFor({ state: "hidden", timeout: 90_000 });
    await shot(page, "03-opportunities.png");

    const cards = page.locator("#opportunity-results li");
    if ((await cards.count()) > 0) {
      await cards.first().getByRole("link").first().click();
      await page.waitForURL(/\/opportunities\//);
      await analyzeAndShot(page);
    } else {
      const suggested = page.locator("a[href^='/opportunities/']").first();
      if ((await suggested.count()) > 0) {
        await suggested.click();
        await page.waitForURL(/\/opportunities\//);
        await analyzeAndShot(page);
      } else {
        console.warn(
          "catalog empty in UI — skipped 04-analysis.png (check API list; use 04b via /screenshot manually)",
        );
      }
    }

    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Ask HULUM", exact: true })
      .click();
    await page.waitForURL(/\/assistant/);
    await page.getByRole("heading", { name: /Ask HULUM/i }).waitFor();
    await page.getByRole("button", { name: /Should I apply\?|Find opportunities for me/i }).first().waitFor();
    const askChip = page.getByRole("button", { name: /Find opportunities for me/i }).first();
    if ((await askChip.count()) > 0) {
      await askChip.click();
      await page.locator("ol[aria-live='polite'] li, [aria-live='polite']").first().waitFor({ timeout: 30_000 }).catch(() => {});
    }
    await shot(page, "05-ask-hulum-text.png");

    await page.locator("select").filter({ has: page.locator('option[value="am"]') }).selectOption("am");
    await page.getByRole("heading", { name: /Ask HULUM|[\u1200-\u137F]+/i }).waitFor();
    await shot(page, "06-ask-hulum-amharic.png");

    console.log("ok: backup screenshot pack (video still open — not recorded)");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
