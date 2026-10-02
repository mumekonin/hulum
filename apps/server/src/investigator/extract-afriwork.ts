import type { ExtractedOpportunity } from "./extract.js";

const MONTHS: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

const DEADLINE = /deadline:\s*([a-z]+)\s+(\d{1,2}),\s*(\d{4})/i;
const JOB_ID = /\/jobs\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function toIsoDate(monthName: string, day: string, year: string): string | undefined {
  const month = MONTHS[monthName.toLowerCase()];
  if (month === undefined) {
    return undefined;
  }
  const dd = day.padStart(2, "0");
  const iso = `${year}-${month}-${dd}`;
  if (Number.isNaN(new Date(`${iso}T00:00:00.000Z`).getTime())) {
    return undefined;
  }
  return iso;
}

/** Read an Afriwork job post from flattened page text. Missing deadline or title means no row. */
export function extractAfriworkJob(pageText: string, pageUrl: string): ExtractedOpportunity | undefined {
  if (!JOB_ID.test(pageUrl) || !/afriworket\.com/i.test(pageUrl)) {
    return undefined;
  }
  const flat = pageText.replace(/\s+/g, " ").trim();
  const deadlineMatch = flat.match(DEADLINE);
  if (deadlineMatch === null) {
    return undefined;
  }
  const month = deadlineMatch[1];
  const day = deadlineMatch[2];
  const year = deadlineMatch[3];
  if (month === undefined || day === undefined || year === undefined) {
    return undefined;
  }
  const deadline = toIsoDate(month, day, year);
  const deadlineEvidence = deadlineMatch[0].trim();
  if (deadline === undefined) {
    return undefined;
  }

  const titleMatch = flat.match(
    /\b([A-Z][\w /&+.-]{2,90}?)\s+(?:Private Client|Posted\s+[A-Z][a-z]+)/,
  );
  const title = titleMatch?.[1]?.trim();
  if (title === undefined || /afriwork|explore jobs|filter jobs|contact us/i.test(title)) {
    return undefined;
  }

  const organization = /private client/i.test(flat)
    ? "Private Client"
    : flat.match(/\bPosted\s+[A-Za-z]+ \d{1,2}, \d{4}\s+from\s+[^.]{0,40}?\b([A-Z][\w &.-]{2,60})\b/)?.[1];
  const org =
    organization ??
    flat.match(/\b([A-Z][\w &.-]{2,60})\s+Jobs Posted:/)?.[1] ??
    undefined;
  if (org === undefined) {
    return undefined;
  }

  const requirement =
    flat.match(/applicants needed:\s*[^.]{2,40}/i)?.[0]?.trim() ??
    flat.match(/skills and expertise\s+[^.]{2,60}/i)?.[0]?.trim() ??
    flat.match(/experience level\s+[^.]{2,40}/i)?.[0]?.trim();
  if (requirement === undefined || requirement.length < 8) {
    return undefined;
  }

  const jobType = flat.match(/job type:\s*([^.]{3,80})/i)?.[1]?.trim();
  const description = jobType !== undefined ? `${title}. ${jobType}.` : title;

  return {
    title,
    organization: org,
    type: "job",
    description,
    deadline,
    countryEligibility: /ethiopia/i.test(flat) ? ["ET"] : [],
    officialSourceUrl: pageUrl,
    applicationUrl: pageUrl,
    deadlineEvidence,
    requirementEvidence: requirement,
  };
}
