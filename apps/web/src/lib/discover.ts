import { OPPORTUNITY_TYPES, type Opportunity, type OpportunityType } from "@hulum/shared";
import { passesRequirementFilters, type ExperienceFilter } from "./discover-filters";
import { daysUntil, requirementLines } from "./format";

export type { ExperienceFilter, FilterOption } from "./discover-filters";
export { catalogLabel, filterOptions } from "./discover-filters";

/**
 * Keyword search over stored listings. This is not AI: it removes filler words, reads an
 * opportunity type from the query, and matches the remaining words against listing text.
 * Words no listing mentions are ignored and reported, so a natural sentence still works.
 */

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "for",
  "of",
  "in",
  "on",
  "at",
  "to",
  "and",
  "or",
  "with",
  "from",
  "by",
  "me",
  "my",
  "i",
  "im",
  "can",
  "could",
  "should",
  "would",
  "show",
  "find",
  "list",
  "search",
  "get",
  "give",
  "want",
  "looking",
  "need",
  "any",
  "some",
  "that",
  "this",
  "these",
  "those",
  "which",
  "what",
  "all",
  "available",
  "opportunity",
  "opportunities",
  "apply",
  "applying",
  "please",
  "is",
  "are",
  "be",
  "there",
  "who",
  "you",
  "your",
  "it",
  "do",
]);

const TYPE_WORDS: Record<OpportunityType, string[]> = {
  scholarship: ["scholarship", "scholarships"],
  fellowship: ["fellowship", "fellowships"],
  internship: ["internship", "internships", "intern", "interns"],
  job: ["job", "jobs", "role", "roles", "position", "positions"],
  grant: ["grant", "grants"],
  competition: ["competition", "competitions", "contest", "contests", "hackathon", "hackathons"],
};

export type ParsedQuery = {
  terms: string[];
  type: OpportunityType | null;
};

function normalizeWord(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/['’]s$/, "")
    .replace(/[^a-z0-9+#]/g, "");
}

/** Reduce common English endings so "students" finds "student" and "Ethiopian" finds "Ethiopia". */
export function stem(word: string): string {
  if (word.length > 5 && word.endsWith("ians")) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith("ian")) return word.slice(0, -1);
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

export function parseQuery(query: string): ParsedQuery {
  let type: OpportunityType | null = null;
  const terms: string[] = [];
  for (const raw of query.split(/\s+/)) {
    const word = normalizeWord(raw);
    if (word === "" || STOP_WORDS.has(word)) continue;
    const typeHit = OPPORTUNITY_TYPES.find((value) => TYPE_WORDS[value].includes(word));
    if (typeHit !== undefined) {
      type ??= typeHit;
      continue;
    }
    const stemmed = stem(word);
    if (!terms.includes(stemmed)) terms.push(stemmed);
  }
  return { terms, type };
}

function searchableText(item: Opportunity): string {
  return [
    item.title,
    item.organization,
    item.description,
    item.type,
    ...item.countryEligibility,
    ...requirementLines(item.educationRequirements),
    ...requirementLines(item.fieldRequirements),
    ...requirementLines(item.experienceRequirements),
    ...requirementLines(item.languageRequirements),
    ...item.documentRequirements,
    ...item.otherRequirements,
  ]
    .join(" ")
    .toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Short terms like "AI" must match a whole word, otherwise "ai" would match "email". */
function termMatches(text: string, term: string): boolean {
  if (term.length <= 3) {
    return new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}([^a-z0-9]|$)`).test(text);
  }
  return text.includes(term);
}

export type DeadlineWindow = "any" | "7" | "30" | "90";

export type DiscoverFilters = {
  type: OpportunityType | "";
  deadline: DeadlineWindow;
  location: string;
  field: string;
  education: string;
  experience: ExperienceFilter;
  includeClosed: boolean;
};

export const EMPTY_FILTERS: DiscoverFilters = {
  type: "",
  deadline: "any",
  location: "",
  field: "",
  education: "",
  experience: "any",
  includeClosed: false,
};

export type DiscoverResult = {
  items: Opportunity[];
  /** Type read from the query when no type chip is selected. */
  inferredType: OpportunityType | null;
  /** Query words that no stored listing mentions. */
  ignoredTerms: string[];
};

function passesFilters(item: Opportunity, filters: DiscoverFilters): boolean {
  const remaining = daysUntil(item.deadline);
  const closed = remaining !== null && remaining < 0;
  if (closed && !filters.includeClosed) return false;
  if (filters.deadline !== "any") {
    if (remaining === null || remaining < 0 || remaining > Number(filters.deadline)) return false;
  }
  return passesRequirementFilters(item, filters);
}

export function discover(
  all: Opportunity[],
  query: string,
  filters: DiscoverFilters,
): DiscoverResult {
  const parsed = parseQuery(query);
  const inferredType = filters.type === "" ? parsed.type : null;
  const type = filters.type === "" ? parsed.type : filters.type;

  const indexed = all.map((item) => ({ item, text: searchableText(item) }));
  const ignoredTerms = parsed.terms.filter(
    (term) => !indexed.some(({ text }) => termMatches(text, term)),
  );
  const activeTerms = parsed.terms.filter((term) => !ignoredTerms.includes(term));

  const items = indexed
    .filter(({ item, text }) => {
      if (type !== null && item.type !== type) return false;
      if (!passesFilters(item, filters)) return false;
      return activeTerms.every((term) => termMatches(text, term));
    })
    .map(({ item }) => item)
    .sort((a, b) => a.deadline.localeCompare(b.deadline));

  return { items, inferredType, ignoredTerms };
}
