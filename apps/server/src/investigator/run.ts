import { createGroqChatClient } from "../ai/groq.js";
import type { AppEnv } from "../config/env.js";
import { withServiceRls } from "../db/rls-session.js";
import { extractAfriworkJob } from "./extract-afriwork.js";
import { extractOpportunities, type ExtractedOpportunity } from "./extract.js";
import { pageContainsEvidence, stripHtml } from "./evidence.js";
import { fetchPageText } from "./fetch-page.js";
import {
  listingFollowScore,
  listingUrls,
  shouldExtractPage,
  sitemapUrlFor,
} from "./official-links.js";
import { createPageRenderer, shouldRenderInBrowser } from "./render-page.js";
import {
  EXTRACT_CONCURRENCY,
  FETCH_CONCURRENCY,
  INVESTIGATE_BUDGET_MS,
  budgetDeadline,
  budgetExpired,
  mapPool,
  takePrioritized,
} from "./pool.js";
import { hostnameOf, isLeadHost, isSafePublicHttpUrl } from "./safety.js";
import { KNOWN_LEAD_HOSTS, resolveSourceUrl, urlGroundedOnPage } from "./source-url.js";
import {
  createRun,
  findDuplicate,
  findExistingByTitle,
  finishRun,
  listEnabledSources,
  listOfficialDomains,
  logEvent,
  markExtractedExpired,
  refreshExtracted,
  rememberOfficialDomain,
  saveExtracted,
  type InvestigationSummary,
  type SourceRow,
} from "./store.js";

export type { InvestigationSummary };

const MAX_PAGES = 800;

function envValue(env: AppEnv, name: string | null): string | undefined {
  if (name === null) {
    return undefined;
  }
  const record = env as unknown as Record<string, string | undefined>;
  return record[name];
}

function deadlineIsFuture(deadline: string, now: Date): boolean {
  const parsed = new Date(`${deadline}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  return parsed.getTime() >= new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).getTime();
}

function normalizeVisitUrl(raw: string): string | undefined {
  try {
    const parsed = new URL(raw);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export async function runInvestigation(env: AppEnv, now: Date = new Date()): Promise<InvestigationSummary> {
  return withServiceRls(() => runInvestigationBody(env, now));
}

async function runInvestigationBody(env: AppEnv, now: Date): Promise<InvestigationSummary> {
  const notes: string[] = [];
  const officialDomains = await listOfficialDomains();
  const sources = await listEnabledSources();
  const leadHosts = [
    ...KNOWN_LEAD_HOSTS,
    ...sources
      .filter((row) => row.is_lead)
      .map((row) => hostnameOf(row.url))
      .filter((host): host is string => host !== undefined),
  ];
  const fetchHosts = [
    ...officialDomains,
    ...leadHosts,
    ...sources
      .map((row) => hostnameOf(row.url === "env:JOB_OPPORTUNITIES_API_URL" ? env.JOB_OPPORTUNITIES_API_URL ?? "" : row.url))
      .filter((host): host is string => host !== undefined),
  ];

  const runId = await createRun();
  const renderer = createPageRenderer();
  try {
  let checked = 0;
  let saved = 0;
  let rejected = 0;
  let refreshed = 0;
  const startedAt = Date.now();
  const deadlineAt = budgetDeadline(startedAt, INVESTIGATE_BUDGET_MS);

  const chat =
    env.GROQ_API_KEY !== undefined && env.GROQ_MODEL !== undefined
      ? createGroqChatClient({ apiKey: env.GROQ_API_KEY, model: env.GROQ_MODEL })
      : undefined;

  const queue: Array<{ sourceName: string; url: string }> = [];
  const seen = new Set<string>();

  const enqueue = (sourceName: string, url: string): void => {
    const key = normalizeVisitUrl(url);
    if (key === undefined || seen.has(key) || !isSafePublicHttpUrl(key)) {
      return;
    }
    seen.add(key);
    queue.push({ sourceName, url: key });
  };

  for (const source of sources) {
    if (source.type === "API") {
      const result = await handleApiSource(env, source, runId);
      notes.push(result);
      continue;
    }
    if (source.type !== "WEB_PAGE") {
      await logEvent(runId, source.name, "skip", "SEARCH sources are not wired in this slice.");
      notes.push(`${source.name}: SEARCH not wired.`);
      continue;
    }
    enqueue(source.name, source.url);
    const sitemap = sitemapUrlFor(source.url);
    if (sitemap !== undefined) {
      enqueue(source.name, sitemap);
    }
  }

  if (chat === undefined) {
    notes.push("GROQ_API_KEY and GROQ_MODEL are required to extract.");
    await logEvent(runId, "worker", "skip", "GROQ_API_KEY and GROQ_MODEL are required to extract.");
  }

  let rootsLeft = queue.length;

  while (chat !== undefined && queue.length > 0 && checked < MAX_PAGES) {
    const mustFinishRoots = rootsLeft > 0;
    if (!mustFinishRoots && budgetExpired(deadlineAt)) {
      break;
    }
    if (mustFinishRoots) {
      rootsLeft = Math.max(0, rootsLeft - Math.min(FETCH_CONCURRENCY, queue.length, rootsLeft));
    }
    const batch = takePrioritized(queue, FETCH_CONCURRENCY, (page) => listingFollowScore(page.url));
    const fetched = await mapPool(batch, FETCH_CONCURRENCY, async (page) => {
      try {
        let html = await fetchPageText(page.url, fetchHosts);
        if (shouldRenderInBrowser(page.url, html)) {
          try {
            html = await renderer.render(page.url);
          } catch (renderError) {
            const message = renderError instanceof Error ? renderError.message : "Browser render failed.";
            notes.push(`${page.sourceName}: ${page.url} browser render failed (${message}).`);
          }
        }
        return { page, html, error: undefined as string | undefined };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Fetch failed.";
        return { page, html: undefined, error: message };
      }
    });

    const ready: Array<{ sourceName: string; url: string; pageText: string; html: string }> = [];
    for (const row of fetched) {
      if (row.error !== undefined || row.html === undefined) {
        rejected += 1;
        await logEvent(runId, row.page.sourceName, "reject", `${row.page.url}: ${row.error ?? "Fetch failed."}`);
        notes.push(`${row.page.sourceName}: ${row.error ?? "Fetch failed."}`);
        continue;
      }
      const pageText = stripHtml(row.html);
      checked += 1;
      for (const listing of listingUrls(row.html, row.page.url)) {
        enqueue(row.page.sourceName, listing);
      }
      ready.push({ sourceName: row.page.sourceName, url: row.page.url, pageText, html: row.html });
    }

    const extractable = ready.filter((page) => shouldExtractPage(page.url, page.pageText));
    const extractedRows = await mapPool(extractable, EXTRACT_CONCURRENCY, async (page) => {
      try {
        const fromAfriwork = extractAfriworkJob(page.pageText, page.url);
        const extracted =
          fromAfriwork !== undefined
            ? [fromAfriwork]
            : await extractOpportunities(chat, page.pageText, page.url);
        return { page, extracted, error: undefined as string | undefined };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Extract failed.";
        return { page, extracted: [] as ExtractedOpportunity[], error: message };
      }
    });

    for (const row of extractedRows) {
      if (row.error !== undefined) {
        rejected += 1;
        await logEvent(runId, row.page.sourceName, "reject", `${row.page.url}: ${row.error}`);
        notes.push(`${row.page.sourceName}: ${row.error}`);
        continue;
      }
      for (const item of row.extracted) {
        if (
          isSafePublicHttpUrl(item.officialSourceUrl) &&
          hostnameOf(item.officialSourceUrl) === hostnameOf(row.page.url)
        ) {
          enqueue(row.page.sourceName, item.officialSourceUrl);
        }
        const why = evaluateExtracted(item, row.page.pageText, row.page.url, now);
        if (why === "deadline is missing or not in the future.") {
          const closed = await markExtractedExpired(item.title, item.deadline);
          if (closed) {
            refreshed += 1;
            await logEvent(runId, row.page.sourceName, "refresh", `${item.title} marked EXPIRED from the source page.`);
          } else {
            rejected += 1;
            await logEvent(runId, row.page.sourceName, "reject", `${item.title}: ${why}`);
          }
          continue;
        }
        if (why !== undefined) {
          rejected += 1;
          await logEvent(runId, row.page.sourceName, "reject", `${item.title}: ${why}`);
          continue;
        }
        const sourceUrl = resolveSourceUrl(item.officialSourceUrl, row.page.url, leadHosts);
        const payload = {
          title: item.title,
          organization: item.organization,
          type: item.type,
          description: item.description,
          deadline: item.deadline,
          countryEligibility: item.countryEligibility,
          applicationUrl: item.applicationUrl,
          sourceUrl,
          requirementEvidence: item.requirementEvidence,
        };
        if ((await findDuplicate(item.title, sourceUrl)) || (await findExistingByTitle(item.title))) {
          await refreshExtracted(payload);
          refreshed += 1;
          await logEvent(runId, row.page.sourceName, "refresh", `${item.title} rewritten from the source page.`);
          continue;
        }
        await saveExtracted(payload);
        const host = hostnameOf(sourceUrl);
        if (host !== undefined && !isLeadHost(host, leadHosts)) {
          await rememberOfficialDomain(host, `Discovered from ${row.page.sourceName}`);
        }
        saved += 1;
        await logEvent(runId, row.page.sourceName, "save", `${item.title} → ${sourceUrl}`);
      }
    }
  }

  if (budgetExpired(deadlineAt) && queue.length > 0) {
    notes.push(`Stopped at ${String(INVESTIGATE_BUDGET_MS)}ms budget with ${String(queue.length)} pages left.`);
  }

  const elapsedMs = Date.now() - startedAt;
  const noteText = [`elapsedMs ${String(elapsedMs)}.`, `refreshed ${String(refreshed)}.`, ...notes].join(" ");
  await finishRun(runId, checked, saved, rejected, noteText);
  return { runId, checked, saved, rejected, refreshed, notes };
  } finally {
    await renderer.close();
  }
}

export function evaluateExtracted(
  item: {
    title: string;
    deadline: string;
    officialSourceUrl: string;
    applicationUrl: string | null;
    deadlineEvidence: string;
    requirementEvidence: string;
  },
  pageText: string,
  fetchedPageUrl: string,
  now: Date,
): string | undefined {
  if (!pageContainsEvidence(pageText, item.deadlineEvidence)) {
    return "deadline evidence was not found on the page.";
  }
  if (!pageContainsEvidence(pageText, item.requirementEvidence)) {
    return "requirement evidence was not found on the page.";
  }
  if (!deadlineIsFuture(item.deadline, now)) {
    return "deadline is missing or not in the future.";
  }
  if (!urlGroundedOnPage(item.officialSourceUrl, pageText, fetchedPageUrl)) {
    return "source URL was not on the fetched page.";
  }
  if (item.applicationUrl !== null && !urlGroundedOnPage(item.applicationUrl, pageText, fetchedPageUrl)) {
    return "application URL was not on the fetched page.";
  }
  return undefined;
}

async function handleApiSource(env: AppEnv, source: SourceRow, runId: string): Promise<string> {
  const key = envValue(env, source.api_key_env);
  const url = envValue(env, source.api_url_env);
  if (key === undefined) {
    await logEvent(runId, source.name, "skip", `${source.api_key_env ?? "API key"} is not set.`);
    return `${source.name}: key env is empty.`;
  }
  if (url === undefined) {
    await logEvent(
      runId,
      source.name,
      "skip",
      `${source.api_url_env ?? "API URL"} is not set. A key without a documented URL is not called.`,
    );
    return `${source.name}: set ${source.api_url_env ?? "JOB_OPPORTUNITIES_API_URL"} when you have the official docs. The key is not used until then.`;
  }
  await logEvent(
    runId,
    source.name,
    "skip",
    "API adapter is not implemented. The URL and key names are reserved so a developer can add the client without inventing an undocumented API.",
  );
  return `${source.name}: API adapter waits for documented endpoints.`;
}
