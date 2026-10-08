import { dbQuery } from "../db/rls-session.js";
import { invalidateOpportunityListCache } from "../opportunities/list-cache.js";

export type SourceRow = {
  id: string;
  name: string;
  type: "WEB_PAGE" | "API" | "SEARCH";
  url: string;
  enabled: boolean;
  is_lead: boolean;
  api_key_env: string | null;
  api_url_env: string | null;
};

export type InvestigationSummary = {
  runId: string;
  checked: number;
  saved: number;
  rejected: number;
  refreshed: number;
  notes: string[];
};

function catalogChanged(changed: boolean): boolean {
  if (changed) {
    invalidateOpportunityListCache();
  }
  return changed;
}

export async function listEnabledSources(): Promise<SourceRow[]> {
  const result = await dbQuery<SourceRow>(
    `select id, name, type, url, enabled, is_lead, api_key_env, api_url_env
     from sources where enabled = true order by name`,
  );
  return result.rows;
}

export async function listOfficialDomains(): Promise<string[]> {
  const result = await dbQuery<{ domain: string }>("select domain from official_domains");
  return result.rows.map((row) => row.domain.toLowerCase());
}

export async function createRun(): Promise<string> {
  const result = await dbQuery<{ id: string }>(
    "insert into investigation_runs (notes) values ($1) returning id",
    [""],
  );
  const id = result.rows[0]?.id;
  if (id === undefined) {
    throw new Error("Failed to start investigation run");
  }
  return id;
}

export async function logEvent(
  runId: string,
  sourceName: string,
  action: string,
  detail: string,
): Promise<void> {
  await dbQuery(
    "insert into investigation_events (run_id, source_name, action, detail) values ($1, $2, $3, $4)",
    [runId, sourceName, action, detail],
  );
}

export async function finishRun(
  runId: string,
  checked: number,
  saved: number,
  rejected: number,
  notes: string,
): Promise<void> {
  await dbQuery(
    `update investigation_runs
     set finished_at = now(), checked = $2, saved = $3, rejected = $4, notes = $5
     where id = $1`,
    [runId, checked, saved, rejected, notes],
  );
}

export async function findDuplicate(title: string, sourceUrl: string): Promise<boolean> {
  const result = await dbQuery(
    "select 1 from opportunities where lower(title) = lower($1) and source_url = $2 limit 1",
    [title, sourceUrl],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function findExistingByTitle(title: string): Promise<boolean> {
  const result = await dbQuery(
    "select 1 from opportunities where lower(title) = lower($1) limit 1",
    [title],
  );
  return (result.rowCount ?? 0) > 0;
}

export async function rememberOfficialDomain(domain: string, note: string): Promise<void> {
  await dbQuery(
    "insert into official_domains (domain, note) values ($1, $2) on conflict (domain) do nothing",
    [domain.toLowerCase(), note],
  );
}

/** Rewrite an already-saved listing from a later evidenced extract. Does not invent a new title. */
export async function refreshExtracted(input: {
  title: string;
  organization: string;
  type: string;
  description: string;
  deadline: string;
  countryEligibility: string[];
  applicationUrl: string | null;
  sourceUrl: string;
  requirementEvidence?: string;
}): Promise<boolean> {
  const otherRequirements = input.requirementEvidence?.trim()
    ? [input.requirementEvidence.trim()]
    : [];
  const result = await dbQuery(
    `update opportunities
     set organization = $2,
         type = $3,
         description = $4,
         deadline = $5::date,
         country_eligibility = $6,
         other_requirements = $7,
         application_url = $8,
         source_url = $9,
         verification_status = 'AI_EXTRACTED',
         investigated_at = now(),
         updated_at = now()
     where lower(title) = lower($1)`,
    [
      input.title,
      input.organization,
      input.type,
      input.description,
      input.deadline,
      input.countryEligibility,
      otherRequirements,
      input.applicationUrl,
      input.sourceUrl,
    ],
  );
  return catalogChanged((result.rowCount ?? 0) > 0);
}

/** Source still shows the listing, but the deadline is no longer in the future. */
export async function markExtractedExpired(title: string, deadline: string): Promise<boolean> {
  const result = await dbQuery(
    `update opportunities
     set deadline = $2::date,
         verification_status = 'EXPIRED',
         investigated_at = now(),
         updated_at = now()
     where lower(title) = lower($1)`,
    [title, deadline],
  );
  return catalogChanged((result.rowCount ?? 0) > 0);
}

/** Seen again on a later run. Does not invent a new listing. */
export async function touchInvestigatedAt(title: string, sourceUrl?: string): Promise<boolean> {
  const result =
    sourceUrl === undefined
      ? await dbQuery(
          `update opportunities
           set investigated_at = now(), updated_at = now()
           where lower(title) = lower($1)`,
          [title],
        )
      : await dbQuery(
          `update opportunities
           set investigated_at = now(), updated_at = now()
           where lower(title) = lower($1) and source_url = $2`,
          [title, sourceUrl],
        );
  return (result.rowCount ?? 0) > 0;
}

/**
 * AI-extracted rows that the worker has not refreshed since `cutoff`
 * become NEEDS_REVIEW. Curated VERIFIED seed rows are left alone.
 */
export async function markStaleExtracts(cutoff: Date): Promise<number> {
  const result = await dbQuery(
    `update opportunities
     set verification_status = 'NEEDS_REVIEW', updated_at = now()
     where verification_status = 'AI_EXTRACTED'
       and (investigated_at is null or investigated_at < $1)`,
    [cutoff.toISOString()],
  );
  const changed = result.rowCount ?? 0;
  if (changed > 0) {
    invalidateOpportunityListCache();
  }
  return changed;
}

export async function saveExtracted(input: {
  title: string;
  organization: string;
  type: string;
  description: string;
  deadline: string;
  countryEligibility: string[];
  applicationUrl: string | null;
  sourceUrl: string;
  requirementEvidence?: string;
}): Promise<string> {
  const otherRequirements = input.requirementEvidence?.trim()
    ? [input.requirementEvidence.trim()]
    : [];
  const result = await dbQuery<{ id: string }>(
    `insert into opportunities (
       title, organization, type, description, deadline, country_eligibility,
       other_requirements, application_url, source_url, verification_status, investigated_at
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'AI_EXTRACTED', now())
     returning id`,
    [
      input.title,
      input.organization,
      input.type,
      input.description,
      input.deadline,
      input.countryEligibility,
      otherRequirements,
      input.applicationUrl,
      input.sourceUrl,
    ],
  );
  const id = result.rows[0]?.id;
  if (id === undefined) {
    throw new Error("Failed to persist extracted opportunity");
  }
  invalidateOpportunityListCache();
  return id;
}
