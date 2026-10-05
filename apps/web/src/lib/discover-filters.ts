import {
  AFRICAN_COUNTRIES,
  EDUCATION_LABELS,
  EDUCATION_LEVELS,
  EDUCATION_RANK,
  type EducationLevel,
  type Opportunity,
} from "@hulum/shared";
import { requirementLines } from "./format";

export type FilterOption = { value: string; label: string; group?: string };

export type ExperienceFilter =
  | "any"
  | "none"
  | "not_required"
  | "intern"
  | "junior"
  | "intermediate"
  | "senior"
  | "leadership"
  | "years_1"
  | "years_2"
  | "years_3_plus"
  | "listed";

export function fold(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function blob(value: string | string[] | null | undefined): string {
  return fold(requirementLines(value).join(" "));
}

/** Same order as AFRICAN_COUNTRIES in @hulum/shared. */
const AFRICA_ISO2 = [
  "dz",
  "ao",
  "bj",
  "bw",
  "bf",
  "bi",
  "cv",
  "cm",
  "cf",
  "td",
  "km",
  "cg",
  "ci",
  "dj",
  "eg",
  "gq",
  "er",
  "sz",
  "et",
  "ga",
  "gm",
  "gh",
  "gn",
  "gw",
  "ke",
  "ls",
  "lr",
  "ly",
  "mg",
  "mw",
  "ml",
  "mr",
  "mu",
  "ma",
  "mz",
  "na",
  "ne",
  "ng",
  "rw",
  "st",
  "sn",
  "sc",
  "sl",
  "so",
  "za",
  "ss",
  "sd",
  "tz",
  "tg",
  "tn",
  "ug",
  "zm",
  "zw",
] as const;

const ISO_TO_NAME = new Map<string, string>();
const NAME_TO_ISO = new Map<string, string>();
const africaCount = Math.min(AFRICAN_COUNTRIES.length, AFRICA_ISO2.length);
for (let i = 0; i < africaCount; i++) {
  const name = AFRICAN_COUNTRIES[i];
  const iso = AFRICA_ISO2[i];
  ISO_TO_NAME.set(iso, name);
  NAME_TO_ISO.set(fold(name), iso);
}

const LOCATION_ALIASES: Record<string, string> = {
  africa: "africa",
  african: "africa",
  "african countries": "africa",
  ethiopian: "et",
  eth: "et",
  kenyan: "ke",
  ken: "ke",
  nigerian: "ng",
  ghanaian: "gh",
  ugandan: "ug",
  rwandan: "rw",
  tanzanian: "tz",
  "south african": "za",
  any: "global",
  all: "global",
  "all countries": "global",
  global: "global",
  international: "global",
  worldwide: "global",
  remote: "remote",
  us: "us",
  usa: "us",
  "united states": "us",
  "united states of america": "us",
  uk: "gb",
  gb: "gb",
  "united kingdom": "gb",
  britain: "gb",
  "great britain": "gb",
  canada: "ca",
  ca: "ca",
  germany: "de",
  de: "de",
  france: "fr",
  fr: "fr",
  australia: "au",
  au: "au",
  japan: "jp",
  jp: "jp",
  "south korea": "kr",
  korea: "kr",
  kr: "kr",
  switzerland: "ch",
  ch: "ch",
  portugal: "pt",
  pt: "pt",
  netherlands: "nl",
  nl: "nl",
  sweden: "se",
  se: "se",
  taiwan: "tw",
  tw: "tw",
  indonesia: "id",
  id: "id",
  thailand: "th",
  th: "th",
  monaco: "mc",
  afghanistan: "af",
  af: "af",
};

const LOCATION_LABELS: Record<string, string> = {
  global: "Global / any country",
  remote: "Remote",
  us: "United States",
  gb: "United Kingdom",
  ca: "Canada",
  de: "Germany",
  fr: "France",
  au: "Australia",
  jp: "Japan",
  kr: "South Korea",
  ch: "Switzerland",
  pt: "Portugal",
  nl: "Netherlands",
  se: "Sweden",
  tw: "Taiwan",
  id: "Indonesia",
  th: "Thailand",
  mc: "Monaco",
  af: "Afghanistan",
};

export function countryId(value: string): string {
  const folded = fold(value);
  if (folded === "") return "";
  const aliased = LOCATION_ALIASES[folded];
  if (aliased !== undefined) return aliased;
  if (ISO_TO_NAME.has(folded)) return folded;
  const fromName = NAME_TO_ISO.get(folded);
  if (fromName !== undefined) return fromName;
  return folded;
}

export function locationLabel(id: string): string {
  if (id === "africa") return "Africa";
  const known = LOCATION_LABELS[id];
  if (known !== undefined) return known;
  const name = ISO_TO_NAME.get(id);
  if (name !== undefined) return name;
  return id.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function locationMatches(item: Opportunity, filter: string): boolean {
  if (filter === "") return true;
  const ids = item.countryEligibility.map(countryId).filter((id) => id !== "");
  if (ids.includes(filter)) return true;
  if (ids.includes("global")) return true;
  if (ids.includes("remote") && filter !== "global") return true;
  if (filter === "africa") {
    return ids.includes("africa") || ids.some((id) => ISO_TO_NAME.has(id));
  }
  if (filter === "global") return ids.includes("global");
  return ISO_TO_NAME.has(filter) && ids.includes("africa");
}

function titleBlob(item: Opportunity): string {
  return fold([item.title, item.organization].join(" "));
}

const CS_FIELD =
  /\b(computer science|computing|informatics|software engineering|information technology|data science|programming|software)\b/;

function isCsField(folded: string): boolean {
  return CS_FIELD.test(folded) || folded === "cs" || folded === "it" || /\bcs\b/.test(folded);
}

function isOpenField(folded: string): boolean {
  return (
    /\bany (field|subject|programme|program|undergraduate major)\b/.test(folded) ||
    /\bnot limited\b/.test(folded) ||
    /\bvaries\b/.test(folded)
  );
}

export const FIELD_BUCKETS: Array<{
  id: string;
  label: string;
  group: string;
  test: (folded: string) => boolean;
}> = [
  {
    id: "computer_science",
    label: "Computer science",
    group: "STEM",
    test: isCsField,
  },
  {
    id: "data_ai",
    label: "Data & AI",
    group: "STEM",
    test: (folded) =>
      /\b(data science|artificial intelligence|machine learning|machine-learning)\b/.test(folded) ||
      /(^| )(ai|ml)( |$)/.test(folded),
  },
  {
    id: "engineering",
    label: "Engineering",
    group: "STEM",
    test: (folded) => /\b(engineer|architect)/.test(folded),
  },
  {
    id: "stem",
    label: "STEM (related)",
    group: "STEM",
    test: (folded) =>
      /\bstem\b/.test(folded) || isCsField(folded) || /\b(engineer|architect)/.test(folded),
  },
  {
    id: "health",
    label: "Health & medicine",
    group: "Other disciplines",
    test: (folded) => /\b(health|medic|nurs|pharma|clinical)\b/.test(folded),
  },
  {
    id: "business",
    label: "Business & economics",
    group: "Other disciplines",
    test: (folded) =>
      /\b(business|econom|finance|mba|entrepren|commerce|management|accounting|accountant|real ?estate)\b/.test(
        folded,
      ),
  },
  {
    id: "development",
    label: "Development & public affairs",
    group: "Other disciplines",
    test: (folded) =>
      /\b(development|international affairs|global affairs|public affairs|civic)\b/.test(folded),
  },
  {
    id: "education_social",
    label: "Education & social science",
    group: "Other disciplines",
    test: (folded) => /\b(education|social science|sociology|psychology|humanit)\b/.test(folded),
  },
  {
    id: "law",
    label: "Law & public policy",
    group: "Other disciplines",
    test: (folded) => /\b(law|lawyer|legal|public policy|policy)\b/.test(folded),
  },
  {
    id: "agriculture",
    label: "Agriculture & environment",
    group: "Other disciplines",
    test: (folded) =>
      /\b(agricultur|environment|climate|conservation|forestry|horticulture|plant science)\b/.test(
        folded,
      ),
  },
  {
    id: "arts",
    label: "Arts & humanities",
    group: "Other disciplines",
    test: (folded) =>
      /\b(arts?|humanities|literature|history|philosophy|music|design)\b/.test(folded),
  },
  {
    id: "media",
    label: "Media & communications",
    group: "Other disciplines",
    test: (folded) =>
      /\b(media|journalis|editorial|video|social media|poetry|content|advertising|communications)\b/.test(
        folded,
      ),
  },
  {
    id: "admin",
    label: "Admin, HR & operations",
    group: "Other disciplines",
    test: (folded) =>
      /\b(receptionist|office|coordinator|dispatcher|clerk|cashier|casher|customer service|human resources|sales)\b/.test(
        folded,
      ) || /(^| )hr( |$)/.test(folded),
  },
];

function fieldText(item: Opportunity): string {
  const structured = blob(item.fieldRequirements);
  return structured !== "" ? structured : titleBlob(item);
}

function fieldIsOther(folded: string): boolean {
  if (folded === "" || isOpenField(folded)) return false;
  return !FIELD_BUCKETS.some((bucket) => bucket.test(folded));
}

export function fieldMatches(item: Opportunity, filter: string): boolean {
  if (filter === "") return true;
  const folded = fieldText(item);
  if (filter === "other") return fieldIsOther(folded);
  const bucket = FIELD_BUCKETS.find((entry) => entry.id === filter);
  if (bucket === undefined) {
    return requirementLines(item.fieldRequirements).some(
      (line) => line === filter || fold(line) === fold(filter),
    );
  }
  return isOpenField(folded) || bucket.test(folded);
}

function canonicalEducation(value: string): EducationLevel | null {
  const underscored = fold(value).replace(/ /g, "_");
  if (underscored === "university_student") return "bachelor_in_progress";
  if ((EDUCATION_LEVELS as readonly string[]).includes(underscored)) {
    return underscored as EducationLevel;
  }
  return null;
}

function isEducationEnumToken(value: string): boolean {
  const underscored = fold(value).replace(/ /g, "_");
  return (
    underscored === "university_student" ||
    (EDUCATION_LEVELS as readonly string[]).includes(underscored)
  );
}

function parseEducationFromText(
  folded: string,
  lines: string[],
): Set<EducationLevel> | "all" | "empty" {
  if (folded === "") return "empty";
  if (
    /\b(not the core gate|degree is not|formal degree is not|not always the only path)\b/.test(
      folded,
    )
  ) {
    return "all";
  }

  const buckets = new Set<EducationLevel>();
  if (lines.length > 0 && lines.every(isEducationEnumToken)) {
    for (const line of lines) {
      const level = canonicalEducation(line);
      if (level !== null) buckets.add(level);
    }
    return buckets.size > 0 ? buckets : "empty";
  }

  if (/\b(phd|doctorate|doctoral|postdoctoral)\b/.test(folded)) buckets.add("phd");
  if (
    /\b(master in progress|masters in progress|pursuing (a )?masters?|enrolled .{0,24}masters?|uk masters? offer|masters? offer|masters? study)\b/.test(
      folded,
    )
  ) {
    buckets.add("master_in_progress");
  }
  if (/\b(masters?|graduate (degree|fellowship|student)|postgraduate)\b/.test(folded)) {
    buckets.add("master_in_progress");
  }
  if (/\b(completed masters?|have (a )?masters?|masters? completed)\b/.test(folded)) {
    buckets.add("master");
  } else if (/\b(ready for honours|honours or masters)\b/.test(folded)) {
    buckets.add("master_in_progress");
    buckets.add("bachelor");
  }

  if (
    /\b(currently enrolled|enrolled as a student|enrolled university|university student|university enrollment|undergraduate student|bachelor in progress|final year undergraduate)\b/.test(
      folded,
    )
  ) {
    buckets.add("bachelor_in_progress");
  }
  if (
    /\b(completed undergraduate|completed bachelors?|bachelors? degree completed|undergraduate degree that will|completed bachelors? degree)\b/.test(
      folded,
    )
  ) {
    buckets.add("bachelor");
  }
  if (/\bapplicants to a .{0,48}bachelors?\b/.test(folded)) {
    buckets.add("high_school");
    buckets.add("bachelor_in_progress");
  }
  if (/\b(bachelors?|undergraduate degree|undergraduate)\b/.test(folded)) {
    if (!buckets.has("bachelor") && !buckets.has("bachelor_in_progress")) {
      buckets.add("bachelor");
    }
  }
  if (/\bdiploma\b/.test(folded)) buckets.add("diploma");
  if (/\bhigh school\b/.test(folded) || /\bsecondary\b/.test(folded)) buckets.add("high_school");

  return buckets.size > 0 ? buckets : "empty";
}

function listingEducationBuckets(item: Opportunity): Set<EducationLevel> | "all" | "empty" {
  const lines = requirementLines(item.educationRequirements);
  const fromStructured = parseEducationFromText(fold(lines.join(" ")), lines);
  if (fromStructured !== "empty") return fromStructured;
  return parseEducationFromText(titleBlob(item), []);
}

export function educationMatches(item: Opportunity, filter: string): boolean {
  if (filter === "") return true;
  const buckets = listingEducationBuckets(item);
  if (buckets === "all") return true;
  if (buckets === "empty") return false;
  return buckets.has(filter as EducationLevel);
}

const YEAR_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
};

export function parseMinYears(texts: string[]): number | null {
  let found: number | null = null;
  for (const text of texts) {
    const folded = fold(text);
    const numeric = folded.match(/(\d+)\s*(?:\+|plus)?\s*(?:years?|yrs?)/);
    if (numeric !== null) {
      const years = Number(numeric[1]);
      found = found === null ? years : Math.max(found, years);
    }
    const spoken = folded.match(/\b(one|two|three|four|five)\s+(?:\+|plus\s+)?years?/);
    if (spoken !== null) {
      const years = YEAR_WORDS[spoken[1]];
      if (years !== undefined) {
        found = found === null ? years : Math.max(found, years);
      }
    }
  }
  return found;
}

function isSoftExperience(folded: string): boolean {
  return (
    /\b(not required|optional|helpful but|nice to have|preferred but)\b/.test(folded) ||
    /\bnot a (professional )?work-experience\b/.test(folded) ||
    /\bnot the main gate\b/.test(folded) ||
    /\bmore than years of employment\b/.test(folded) ||
    /\bnot an internship posting\b/.test(folded)
  );
}

export const EXPERIENCE_BUCKETS: Array<{
  value: ExperienceFilter;
  label: string;
  group?: string;
}> = [
  { value: "any", label: "Any experience" },
  { value: "none", label: "No experience listed", group: "Requirement" },
  { value: "not_required", label: "Not required / optional", group: "Requirement" },
  { value: "intern", label: "Intern / student", group: "Requirement" },
  { value: "junior", label: "Junior / beginner", group: "Level" },
  { value: "intermediate", label: "Intermediate / mid-level", group: "Level" },
  { value: "senior", label: "Senior / advanced", group: "Level" },
  { value: "years_1", label: "About 1 year", group: "Years of experience" },
  { value: "years_2", label: "About 2 years", group: "Years of experience" },
  { value: "years_3_plus", label: "3+ years", group: "Years of experience" },
  { value: "leadership", label: "Leadership / impact", group: "Mentioned" },
  { value: "listed", label: "Experience mentioned", group: "Mentioned" },
];

export function experienceMatches(item: Opportunity, filter: ExperienceFilter): boolean {
  if (filter === "any") return true;
  const lines = requirementLines(item.experienceRequirements);
  const structured = fold(lines.join(" "));
  const folded = structured !== "" ? structured : titleBlob(item);
  const has = lines.length > 0;
  if (filter === "none") return !has && item.type !== "internship";
  if (filter === "listed") return has;
  const years = parseMinYears(lines.length > 0 ? lines : [item.title]);
  if (filter === "not_required") return isSoftExperience(folded);
  if (filter === "intern") {
    if (item.type === "internship") return true;
    if (/\bnot (a |an )?(junior )?internship\b/.test(folded)) return false;
    return /\binternships?\b/.test(folded) && (years === null || years <= 1);
  }
  if (filter === "junior") return /\b(junior|beginner|entry[- ]level)\b/.test(folded);
  if (filter === "intermediate") return /\b(intermediate|mid[- ]level)\b/.test(folded);
  if (filter === "senior") return /\b(senior|expert|advanced)\b/.test(folded);
  if (filter === "leadership") {
    return /\b(leadership|community impact|character|entrepreneurs?|founders?)\b/.test(folded);
  }
  if (filter === "years_1") return years === 1;
  if (filter === "years_2") return years === 2;
  if (filter === "years_3_plus") return years !== null && years >= 3;
  return false;
}

export function catalogLabel(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") return trimmed;
  const underscored = fold(trimmed).replace(/ /g, "_");
  if (underscored === "university_student") return EDUCATION_LABELS.bachelor_in_progress;
  if ((EDUCATION_LEVELS as readonly string[]).includes(underscored)) {
    return EDUCATION_LABELS[underscored as EducationLevel];
  }
  const location = countryId(trimmed);
  if (
    location === "africa" ||
    ISO_TO_NAME.has(location) ||
    LOCATION_LABELS[location] !== undefined
  ) {
    return locationLabel(location);
  }
  if (underscored.includes("_")) {
    return trimmed.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return trimmed;
}

export type DiscoverFilterMatch = {
  location: string;
  field: string;
  education: string;
  experience: ExperienceFilter;
};

export function passesRequirementFilters(item: Opportunity, filters: DiscoverFilterMatch): boolean {
  if (!locationMatches(item, filters.location)) return false;
  if (!fieldMatches(item, filters.field)) return false;
  if (!educationMatches(item, filters.education)) return false;
  if (!experienceMatches(item, filters.experience)) return false;
  return true;
}

function uniqueOptions(options: FilterOption[]): FilterOption[] {
  const seen = new Set<string>();
  const result: FilterOption[] = [];
  for (const option of options) {
    if (seen.has(option.value)) continue;
    seen.add(option.value);
    result.push(option);
  }
  return result.sort((a, b) => a.label.localeCompare(b.label));
}

/** Distinct buckets that at least one stored listing matches, so filters never offer an empty option. */
export function filterOptions(all: Opportunity[]): {
  locations: FilterOption[];
  fields: FilterOption[];
  education: FilterOption[];
  experience: FilterOption[];
} {
  const locations = uniqueOptions(
    all
      .flatMap((item) =>
        item.countryEligibility.map((value) => {
          const id = countryId(value);
          return { value: id, label: locationLabel(id) };
        }),
      )
      .filter((option) => option.value !== ""),
  );

  const fields: FilterOption[] = FIELD_BUCKETS.filter((bucket) =>
    all.some((item) => fieldMatches(item, bucket.id)),
  ).map((bucket) => ({ value: bucket.id, label: bucket.label, group: bucket.group }));
  if (all.some((item) => fieldMatches(item, "other"))) {
    fields.push({ value: "other", label: "Other fields", group: "Other disciplines" });
  }

  const education: FilterOption[] = EDUCATION_LEVELS.filter((level) =>
    all.some((item) => educationMatches(item, level)),
  ).map((level) => ({
    value: level,
    label: EDUCATION_LABELS[level],
    group:
      EDUCATION_RANK[level] <= EDUCATION_RANK.bachelor ? "School & undergraduate" : "Postgraduate",
  }));

  const experience: FilterOption[] = EXPERIENCE_BUCKETS.filter(
    (bucket) => bucket.value === "any" || all.some((item) => experienceMatches(item, bucket.value)),
  );

  return { locations, fields, education, experience };
}
