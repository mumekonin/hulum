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
    await page.getByText(/Know what is worth/i).first().waitFor();
    await page.getByRole("link", { name: /Get started|Sign in/i }).first().click();
    await page.waitForURL(/\/sign-in/);

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
    // New accounts go through onboarding; each step saves before moving on.
    await page.waitForURL(/\/onboarding/);
    const saveStep = async (label) => {
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
    };

    await page.getByRole("heading", { name: /About you/i }).waitFor();
    await page.locator("#onboarding-country").fill("Ethiopia");
    await page.locator("#onboarding-city").fill("Addis Ababa");
    await saveStep("Onboarding: about you");

    await page.getByRole("heading", { name: /Education/i }).waitFor();
    await page.locator("#onboarding-education").selectOption("bachelor_in_progress");
    await page.locator("#onboarding-field").fill("Computer Science");
    await page.locator("#onboarding-graduation").fill("2027");
    await saveStep("Onboarding: education");

    await page.getByRole("heading", { name: /Skills and experience/i }).waitFor();
    await page.locator("#onboarding-languages").fill("English, Amharic");
    await page.locator("#onboarding-skills").fill("Python, React");
    await page.locator("#onboarding-experience").fill("One software internship.");
    await page.locator("#onboarding-interests").fill("AI, scholarships");
    await saveStep("Onboarding: skills");

    await page.getByRole("heading", { name: /Your CV/i }).waitFor();
    await page.getByRole("button", { name: /Skip for now/i }).click();
    await page.getByRole("heading", { name: /You're set up/i }).waitFor();
    await page.getByRole("link", { name: /Find opportunities/i }).click();
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

    console.log("ok: welcome → register → onboarding → opportunities → screenshot → Ask HULUM text fallback");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
