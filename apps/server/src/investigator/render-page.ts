import { stripHtml } from "./evidence.js";
import { isListingDetailUrl, listingUrls, shouldExtractPage } from "./official-links.js";
import { hostnameOf } from "./safety.js";

const RENDER_TIMEOUT_MS = 25_000;
const SCROLL_ROUNDS = 6;

export type PageRenderer = {
  render: (url: string) => Promise<string>;
  close: () => Promise<void>;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Afriwork Explore jobs and job posts load cards only after JavaScript runs. */
export function shouldRenderInBrowser(url: string, html: string): boolean {
  const host = hostnameOf(url);
  if (host !== "afriworket.com") {
    return false;
  }
  let path: string;
  try {
    path = new URL(url).pathname;
  } catch {
    return false;
  }
  if (/\.xml$/i.test(path)) {
    return false;
  }
  if (path === "/jobs" || path === "/jobs/") {
    return listingUrls(html, url).every((item) => !isListingDetailUrl(item));
  }
  if (isListingDetailUrl(url)) {
    return !shouldExtractPage(url, stripHtml(html));
  }
  return false;
}

export function createPageRenderer(): PageRenderer {
  let browserPromise: Promise<{ newPage: () => Promise<RenderPage>; close: () => Promise<void> }> | undefined;
  let closed = false;

  async function getBrowser(): Promise<{ newPage: () => Promise<RenderPage>; close: () => Promise<void> }> {
    if (closed) {
      throw new Error("Renderer already closed.");
    }
    if (browserPromise === undefined) {
      browserPromise = launchBrowser();
    }
    return browserPromise;
  }

  return {
    async render(url: string): Promise<string> {
      const browser = await getBrowser();
      const page = await browser.newPage();
      try {
        page.setDefaultTimeout(RENDER_TIMEOUT_MS);
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: RENDER_TIMEOUT_MS });
        await waitForJobCards(page);
        return await page.content();
      } finally {
        await page.close();
      }
    },
    async close(): Promise<void> {
      closed = true;
      if (browserPromise === undefined) {
        return;
      }
      const browser = await browserPromise.catch(() => undefined);
      await browser?.close();
    },
  };
}

type RenderPage = {
  setDefaultTimeout: (ms: number) => void;
  goto: (url: string, options: { waitUntil: "domcontentloaded"; timeout: number }) => Promise<unknown>;
  mouse: { wheel: (deltaX: number, deltaY: number) => Promise<void> };
  locator: (selector: string) => { count: () => Promise<number> };
  waitForSelector: (selector: string, options: { timeout: number }) => Promise<unknown>;
  content: () => Promise<string>;
  close: () => Promise<void>;
};

async function launchBrowser(): Promise<{ newPage: () => Promise<RenderPage>; close: () => Promise<void> }> {
  const playwright = await import("playwright");
  try {
    return await playwright.chromium.launch({ headless: true, channel: "chrome" });
  } catch {
    return await playwright.chromium.launch({ headless: true });
  }
}

async function waitForJobCards(page: RenderPage): Promise<void> {
  for (let round = 0; round < SCROLL_ROUNDS; round += 1) {
    await page.mouse.wheel(0, 2400);
    const found = await page.locator('a[href*="/jobs/"]').count();
    if (found > 1) {
      break;
    }
    await wait(700);
  }
  await page.waitForSelector('a[href*="/jobs/"]', { timeout: 8_000 }).catch(() => undefined);
}
