#!/usr/bin/env node
/**
 * Local browser smoke (clean Chromium) — JWT register path, not production, not mic.
 * Catalog seed is closed; does not require A2SV APPLY.
 *
 *   npm run db:migrate
 *   npm run dev
 *   npm run smoke:browser
 */

import { chromium } from "playwright";

const WEB = process.env.WEB_URL ?? "http://127.0.0.1:3000";
const timeout = 60_000;

async function assertOk(response, label) {
  if (!response.ok()) {
    const body = await response.text().catch(() => "");
    throw new Error(`${label} failed: ${response.status()} ${body.slice(0, 500)}`);
  }
}

async function main() {
  const email = `ci.browser.${String(Date.now())}@example.invalid`;
  console.log(`smoke:browser → ${WEB} (${email})`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(timeout);

  try {
    await page.goto(WEB, { waitUntil: "domcontentloaded" });
    await page.getByText("HULUM", { exact: true }).first().waitFor();

    await page.getByRole("link", { name: /Create account/i }).click();
    await page.waitForURL(/\/verify/);

    await page.locator("#register-name").fill("CI Browser");
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
    await page.waitForURL(/\/profile/);
    await page.getByRole("heading", { name: /Your profile/i }).waitFor();

    await page.locator("#profile-name").fill("Abeba Tesfaye");
    await page.locator("#profile-email").fill(email);
    await page.locator("#profile-field").fill("Computer Science");
    await page.locator("#profile-country").fill("Ethiopia");
    await page.locator("#profile-city").fill("Addis Ababa");
    await page.locator("#profile-languages").fill("English, Amharic");
    await page.locator("#profile-skills").fill("Python, React");
    await page.locator("#profile-experience").fill("One software internship.");
    await page.locator("#profile-interests").fill("AI, scholarships");

    const savePromise = page.waitForResponse((response) => {
      const method = response.request().method();
      if (method !== "POST" && method !== "PATCH") return false;
      try {
        return /\/api\/profile(\/|$)/.test(new URL(response.url()).pathname);
      } catch {
        return false;
      }
    });
    await page.getByRole("button", { name: /Save profile/i }).click();
    await assertOk(await savePromise, "Save profile");
    // Save navigates to the catalog
    await page.waitForURL(/\/opportunities/);
    await page.getByRole("heading", { name: /Find opportunities worth your time/i }).waitFor();

    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Screenshot", exact: true })
      .click();
    await page.waitForURL(/\/screenshot/);
    await page.getByRole("heading", { name: /Analyze a screenshot/i }).waitFor();
    await page.locator("#screenshot").waitFor();
    await page.getByText(/does not invent a deadline or apply link/i).first().waitFor();

    // Prefer Primary nav — page-wide "Ask HULUM" can match header + in-page CTAs (strict mode).
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Ask HULUM", exact: true })
      .click();
    await page.waitForURL(/\/assistant/);
    await page.getByRole("heading", { name: /Ask HULUM|ሁሉምን ጠይቅ/i }).waitFor();
    await page.getByText(/Microphone unavailable|Type or use a quick action|ማይክሮፎን/i).first().waitFor();

    console.log("ok: register → profile → opportunities → screenshot → Ask HULUM text fallback");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
