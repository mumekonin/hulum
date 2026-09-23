import { createGroqChatClient } from "../ai/groq.js";
import type { AppEnv } from "../config/env.js";
import { extractOpportunities } from "./extract.js";
import { pageContainsEvidence, stripHtml } from "./evidence.js";
import { fetchPageText } from "./fetch-page.js";
import { hostnameOf, isAllowedOfficialUrl } from "./safety.js";
import {
  createRun,
  findDuplicate,
  finishRun,
  listEnabledSources,
  listOfficialDomains,
  logEvent,
  saveExtracted,
  type InvestigationSummary,
  type SourceRow,
} from "./store.js";

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

function sameOfficialDomain(applicationUrl: string | null, sourceUrl: string): boolean {
  if (applicationUrl === null) {
    return true;
  }
  const apply = hostnameOf(applicationUrl);
  const source = hostnameOf(sourceUrl);
  return apply !== undefined && source !== undefined && (apply === source || apply.endsWith(`.${source}`) || source.endsWith(`.${apply}`));
}

export async function runInvestigation(env: AppEnv, now: Date = new Date()): Promise<InvestigationSummary> {
  const notes: string[] = [];
  const officialDomains = await listOfficialDomains();
  const sources = await listEnabledSources();
  const fetchHosts = [
    ...officialDomains,
    ...sources.map((row) => hostnameOf(row.url === "env:JOB_OPPORTUNITIES_API_URL" ? env.JOB_OPPORTUNITIES_API_URL ?? "" : row.url)).filter((host): host is string => host !== undefined),
  ];

  const runId = await createRun();
  let checked = 0;
  let saved = 0;
  let rejected = 0;

  const chat =
    env.GROQ_API_KEY !== undefined && env.GROQ_MODEL !== undefined
      ? createGroqChatClient({ apiKey: env.GROQ_API_KEY, model: env.GROQ_MODEL })
      : undefined;

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
    if (chat === undefined) {
      await logEvent(runId, source.name, "skip", "GROQ_API_KEY and GROQ_MODEL are required to extract.");
      notes.push(`${source.name}: Groq is not configured.`);
      continue;
    }

    let html: string;
    try {
      html = await fetchPageText(source.url, fetchHosts);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fetch failed.";
      rejected += 1;
      await logEvent(runId, source.name, "reject", message);
      notes.push(`${source.name}: ${message}`);
      continue;
    }

    const pageText = stripHtml(html);
    checked += 1;
    let extracted;
    try {
      extracted = await extractOpportunities(chat, pageText);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Extract failed.";
      rejected += 1;
      await logEvent(runId, source.name, "reject", message);
      notes.push(`${source.name}: ${message}`);
      continue;
    }

    for (const item of extracted) {
      const why = rejectReason(item, pageText, officialDomains, now);
      if (why !== undefined) {
        rejected += 1;
        await logEvent(runId, source.name, "reject", `${item.title}: ${why}`);
        continue;
      }
      if (await findDuplicate(item.title, item.officialSourceUrl)) {
        rejected += 1;
        await logEvent(runId, source.name, "reject", `${item.title}: duplicate title and source URL.`);
        continue;
      }
      await saveExtracted({
        title: item.title,
        organization: item.organization,
        type: item.type,
        description: item.description,
        deadline: item.deadline,
        countryEligibility: item.countryEligibility,
        applicationUrl: item.applicationUrl,
        sourceUrl: item.officialSourceUrl,
      });
      saved += 1;
      await logEvent(runId, source.name, "save", `${item.title} → ${item.officialSourceUrl}`);
    }
  }

  const noteText = notes.join(" ");
  await finishRun(runId, checked, saved, rejected, noteText);
  return { runId, checked, saved, rejected, notes };
}

function rejectReason(
  item: {
    title: string;
    deadline: string;
    officialSourceUrl: string;
    applicationUrl: string | null;
    deadlineEvidence: string;
    requirementEvidence: string;
  },
  pageText: string,
  officialDomains: string[],
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
  if (!isAllowedOfficialUrl(item.officialSourceUrl, officialDomains)) {
    return "officialSourceUrl is not on official_domains. Aggregators stay leads.";
  }
  if (!sameOfficialDomain(item.applicationUrl, item.officialSourceUrl)) {
    return "applicationUrl is not on the same official domain.";
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
