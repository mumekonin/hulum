#!/usr/bin/env node
/**
 * Local browser smoke (clean Chromium profile) — not production, not mic.
 * Requires: API :3001 + web :3000, migrated + seeded Postgres.
 *
 *   npm run db:migrate && npm run db:seed
 *   npm run dev
 *   npm run smoke:browser
 */

import { chromium } from "playwright";

const WEB = process.env.WEB_URL ?? "http://127.0.0.1:3000";
const timeout = 60_000;

async function main() {
  console.log(`smoke:browser → ${WEB}`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(timeout);

  try {
    await page.goto(WEB, { waitUntil: "domcontentloaded" });
    await page.getByText("HULUM", { exact: true }).first().waitFor();

    // Gateway Continue → local UUID → /profile
    await page.getByRole("button", { name: /^Continue$/ }).click();
    await page.waitForURL(/\/profile/);
    await page.getByRole("button", { name: /Use demo profile/i }).click();
    // Demo save navigates straight to the catalog
    await page.waitForURL(/\/opportunities/);
    await page.getByRole("link", { name: /A2SV/i }).first().click();
    await page.getByRole("heading", { name: /A2SV/i }).waitFor();

    await page.getByRole("button", { name: /Analyze for me/i }).click();
    await page.waitForURL(/\/analysis\//);
    await page.getByText("APPLY", { exact: true }).first().waitFor({ timeout });

    await page.getByRole("link", { name: "Ask HULUM" }).click();
    await page.waitForURL(/\/assistant/);
    await page.getByRole("heading", { name: /Ask HULUM|ሁሉምን ጠይቅ/i }).waitFor();
    await page.getByText(/Microphone unavailable|Type or use a quick action|ማይክሮፎን/i).first().waitFor();

    console.log("ok: gateway → demo → A2SV APPLY → Ask HULUM text fallback");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
