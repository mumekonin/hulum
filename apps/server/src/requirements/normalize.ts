import {
  AFRICAN_COUNTRIES,
  EDUCATION_LABELS,
  EDUCATION_LEVELS,
  EDUCATION_RANK,
  type EducationLevel,
} from "@hulum/shared";

const EDUCATION_SET = new Set<string>(EDUCATION_LEVELS);

const COUNTRY_ID: Record<string, string> = {
  algeria: "dz",
  dz: "dz",
  angola: "ao",
  ao: "ao",
  benin: "bj",
  bj: "bj",
  botswana: "bw",
  bw: "bw",
  "burkina faso": "bf",
  bf: "bf",
  burundi: "bi",
  bi: "bi",
  "cabo verde": "cv",
  "cape verde": "cv",
  cv: "cv",
  cameroon: "cm",
  cm: "cm",
  "central african republic": "cf",
  cf: "cf",
  chad: "td",
  td: "td",
  comoros: "km",
  km: "km",
  congo: "cg",
  cg: "cg",
  "cote divoire": "ci",
  "ivory coast": "ci",
  ci: "ci",
  djibouti: "dj",
  dj: "dj",
  egypt: "eg",
  eg: "eg",
  "equatorial guinea": "gq",
  gq: "gq",
  eritrea: "er",
  er: "er",
  eswatini: "sz",
  swaziland: "sz",
  sz: "sz",
  ethiopia: "et",
  ethiopian: "et",
  et: "et",
  eth: "et",
  gabon: "ga",
  ga: "ga",
  gambia: "gm",
  gm: "gm",
  ghana: "gh",
  gh: "gh",
  guinea: "gn",
  gn: "gn",
  "guinea bissau": "gw",
  gw: "gw",
  kenya: "ke",
  kenyan: "ke",
  ke: "ke",
  ken: "ke",
  lesotho: "ls",
  ls: "ls",
  liberia: "lr",
  lr: "lr",
  libya: "ly",
  ly: "ly",
  madagascar: "mg",
  mg: "mg",
  malawi: "mw",
  mw: "mw",
  mali: "ml",
  ml: "ml",
  mauritania: "mr",
  mr: "mr",
  mauritius: "mu",
  mu: "mu",
  morocco: "ma",
  ma: "ma",
  mozambique: "mz",
  mz: "mz",
  namibia: "na",
  na: "na",
  niger: "ne",
  ne: "ne",
  nigeria: "ng",
  ng: "ng",
  rwanda: "rw",
  rw: "rw",
  "sao tome and principe": "st",
  st: "st",
  senegal: "sn",
  sn: "sn",
  seychelles: "sc",
  sc: "sc",
  "sierra leone": "sl",
  sl: "sl",
  somalia: "so",
  so: "so",
  "south africa": "za",
  za: "za",
  "south sudan": "ss",
  ss: "ss",
  sudan: "sd",
  sd: "sd",
  tanzania: "tz",
  tz: "tz",
  togo: "tg",
  tg: "tg",
  tunisia: "tn",
  tn: "tn",
  uganda: "ug",
  ug: "ug",
  zambia: "zm",
  zm: "zm",
  zimbabwe: "zw",
  zw: "zw",
  "united states": "us",
  "united states of america": "us",
  usa: "us",
  us: "us",
  "united kingdom": "gb",
  britain: "gb",
  uk: "gb",
  gb: "gb",
};

const LANGUAGE_ID: Record<string, string> = {
  en: "en",
  eng: "en",
  english: "en",
  am: "am",
  amh: "am",
  amharic: "am",
  amarigna: "am",
  "አማርኛ": "am",
  om: "om",
  oro: "om",
  oromo: "om",
  "afaan oromo": "om",
  "afaan oromoo": "om",
  fr: "fr",
  fra: "fr",
  french: "fr",
  ar: "ar",
  ara: "ar",
  arabic: "ar",
  sw: "sw",
  swa: "sw",
  swahili: "sw",
  kiswahili: "sw",
};

const LANGUAGE_ALIASES = Object.keys(LANGUAGE_ID).sort((a, b) => b.length - a.length);

const FIELD_STOP = new Set([
  "any",
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "related",
  "field",
  "fields",
  "programme",
  "program",
  "subject",
  "subjects",
  "closely",
  "typically",
  "usually",
  "including",
  "listed",
  "applicant",
  "applicants",
  "duty",
  "station",
  "posting",
  "varies",
  "vacancy",
  "depending",
  "offered",
  "partner",
  "university",
  "courses",
  "postgraduate",
  "undergraduate",
  "major",
  "global",
  "affairs",
  "across",
  "track",
  "tracks",
  "not",
  "limited",
  "only",
  "path",
  "common",
  "but",
  "always",
  "helpful",
  "enrollment",
  "learners",
  "building",
  "career",
  "switchers",
  "tech",
]);

const CS_FIELD = /\b(computer science|computing|informatics|software engineering|information technology|data science|programming)\b/;

export function fold(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_/,]+/g, " ")
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const AFRICA_IDS = new Set(
  AFRICAN_COUNTRIES.map((name) => COUNTRY_ID[fold(name)]).filter((id): id is string => Boolean(id)),
);

export function asStringList(value: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter((item) => item !== "");
  }
  const trimmed = value.trim();
  return trimmed === "" ? [] : [trimmed];
}

export function hasText(value: string | null | undefined): value is string {
  return value !== null && value !== undefined && value.trim() !== "";
}

export function countryId(value: string): string {
  const folded = fold(value);
  if (folded === "africa" || folded === "african" || folded === "african countries") {
    return "africa";
  }
  return COUNTRY_ID[folded] ?? folded;
}

export function countryEligible(profileCountry: string, required: string[]): boolean {
  const have = countryId(profileCountry);
  const allowed = required.map(countryId);
  if (allowed.includes(have)) {
    return true;
  }
  return allowed.includes("africa") && AFRICA_IDS.has(have);
}

export function canonicalEducation(value: string): EducationLevel | null {
  const folded = fold(value);
  const underscored = folded.replace(/ /g, "_");
  if (underscored === "university_student") {
    return "bachelor_in_progress";
  }
  if (EDUCATION_SET.has(underscored)) {
    return underscored as EducationLevel;
  }
  return null;
}

export function educationDisplay(value: string): string {
  const canonical = canonicalEducation(value);
  if (canonical !== null) {
    return EDUCATION_LABELS[canonical];
  }
  return value.trim().replace(/_/g, " ");
}

export type EducationNeed =
  | { kind: "none" }
  | { kind: "open" }
  | { kind: "unknown" }
  | { kind: "min"; level: EducationLevel; enrolledOk: boolean };

function isEducationEnumToken(value: string): boolean {
  const folded = fold(value);
  const underscored = folded.replace(/ /g, "_");
  return underscored === "university_student" || EDUCATION_SET.has(underscored);
}

function parseEducationPhrase(text: string): EducationNeed {
  const folded = fold(text);
  if (folded === "") {
    return { kind: "none" };
  }
  if (
    /\b(not the core gate|degree is not|formal degree is not|not always the only path)\b/.test(folded)
  ) {
    return { kind: "open" };
  }

  const exact = canonicalEducation(text);
  if (exact !== null && isEducationEnumToken(text)) {
    return {
      kind: "min",
      level: exact,
      enrolledOk: exact.endsWith("_in_progress") || fold(text).replace(/ /g, "_") === "university_student",
    };
  }

  if (/\b(phd|doctorate|doctoral)\b/.test(folded)) {
    return { kind: "min", level: "phd", enrolledOk: false };
  }
  if (/\b(master in progress|masters in progress|pursuing (a )?masters?|enrolled .{0,24}masters?)\b/.test(folded)) {
    return { kind: "min", level: "master_in_progress", enrolledOk: true };
  }
  if (/\b(graduate student or final year|final year undergraduate)\b/.test(folded)) {
    return { kind: "min", level: "bachelor_in_progress", enrolledOk: true };
  }
  if (/\b(ready for honours|honours or masters|graduate student)\b/.test(folded)) {
    return { kind: "min", level: "bachelor", enrolledOk: false };
  }
  if (
    /\b(completed undergraduate|completed bachelors?|bachelors? degree completed|undergraduate degree that will|completed bachelors? degree)\b/.test(
      folded,
    )
  ) {
    return { kind: "min", level: "bachelor", enrolledOk: false };
  }
  if (/\bapplicants to a .{0,48}bachelors?\b/.test(folded)) {
    return { kind: "min", level: "high_school", enrolledOk: true };
  }
  if (
    /\b(currently enrolled|enrolled as a student|enrolled university|university student|undergraduate student|bachelor in progress)\b/.test(
      folded,
    )
  ) {
    return { kind: "min", level: "bachelor_in_progress", enrolledOk: true };
  }
  if (/\b(bachelors?|undergraduate degree)\b/.test(folded)) {
    return { kind: "min", level: "bachelor", enrolledOk: true };
  }
  if (/\bdiploma\b/.test(folded)) {
    return { kind: "min", level: "diploma", enrolledOk: false };
  }
  if (/\bhigh school\b/.test(folded)) {
    return { kind: "min", level: "high_school", enrolledOk: false };
  }
  return { kind: "unknown" };
}

export function parseEducationNeed(required: string[]): EducationNeed {
  if (required.length === 0) {
    return { kind: "none" };
  }
  if (required.every(isEducationEnumToken)) {
    const mapped = required.map((item) => parseEducationPhrase(item));
    const mins = mapped.filter((item): item is { kind: "min"; level: EducationLevel; enrolledOk: boolean } => item.kind === "min");
    if (mins.length === 0) {
      return { kind: "unknown" };
    }
    return mins.reduce((lowest, item) =>
      EDUCATION_RANK[item.level] <= EDUCATION_RANK[lowest.level] ? item : lowest,
    );
  }
  return parseEducationPhrase(required.join(" "));
}

export function educationMeets(
  have: EducationLevel,
  need: Extract<EducationNeed, { kind: "min" }>,
): "met" | "not_met" | "uncertain" {
  const haveRank = EDUCATION_RANK[have];
  const needRank = EDUCATION_RANK[need.level];
  const inProgress = have.endsWith("_in_progress");
  if (need.enrolledOk && haveRank >= EDUCATION_RANK.bachelor_in_progress) {
    return "met";
  }
  if (haveRank >= needRank && !inProgress) {
    return "met";
  }
  if (inProgress && haveRank >= needRank) {
    return "met";
  }
  if (inProgress && haveRank >= needRank - 1) {
    return "uncertain";
  }
  return "not_met";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function languageIds(values: string[]): string[] {
  const found = new Set<string>();
  for (const value of values) {
    const folded = fold(value);
    if (folded === "") {
      continue;
    }
    const direct = LANGUAGE_ID[folded];
    if (direct !== undefined) {
      found.add(direct);
      continue;
    }
    for (const alias of LANGUAGE_ALIASES) {
      const id = LANGUAGE_ID[alias];
      if (id === undefined) {
        continue;
      }
      const pattern =
        alias.length <= 3
          ? new RegExp(`(?:^|\\s)${escapeRegExp(alias)}(?:\\s|$)`)
          : new RegExp(`\\b${escapeRegExp(alias)}\\b`);
      if (pattern.test(folded)) {
        found.add(id);
      }
    }
  }
  return [...found];
}

export function isOpenField(text: string): boolean {
  const folded = fold(text);
  return (
    /\bany (field|subject|programme|program|undergraduate major)\b/.test(folded) ||
    /\bnot limited\b/.test(folded) ||
    /\bvaries\b/.test(folded)
  );
}

function isCsField(text: string): boolean {
  const folded = fold(text);
  return CS_FIELD.test(folded) || folded === "cs" || folded === "it" || folded === "software";
}

function significantTokens(value: string): string[] {
  return fold(value)
    .split(" ")
    .filter((token) => token.length > 2 && !FIELD_STOP.has(token));
}

export function fieldsOverlap(profileValue: string, required: string[]): boolean {
  const have = fold(profileValue);
  if (have === "") {
    return false;
  }
  if (required.some(isOpenField)) {
    return true;
  }
  for (const item of required) {
    const need = fold(item);
    if (need === "") {
      continue;
    }
    if (have.length >= 4 && (need.includes(have) || have.includes(need))) {
      return true;
    }
    const haveTokens = significantTokens(profileValue);
    const needTokens = significantTokens(item);
    const hits = haveTokens.filter((token) => needTokens.includes(token));
    if (hits.length >= 2) {
      return true;
    }
    if (hits.length === 1 && hits[0] !== "science" && hits[0] !== "studies") {
      return true;
    }
    if (isCsField(have) && (/\bstem\b/.test(need) || /\bsoftware\b/.test(need))) {
      return true;
    }
  }
  return false;
}

export function isSoftRequirement(text: string): boolean {
  const folded = fold(text);
  return (
    /\bnot required\b/.test(folded) ||
    /\boptional\b/.test(folded) ||
    /\bhelpful but\b/.test(folded) ||
    /\bnice to have\b/.test(folded) ||
    /\bpreferred but\b/.test(folded)
  );
}

export function isOfficialConfirmNotice(text: string): boolean {
  const folded = fold(text);
  return (
    /\b(confirm|verify|see|check|visit)\b/.test(folded) &&
    /\b(official|source|website|site|page)\b/.test(folded)
  );
}

export function parseMinYears(texts: string[]): number | null {
  let found: number | null = null;
  for (const text of texts) {
    const match = fold(text).match(/(\d+)\s*(?:\+|plus)?\s*(?:years?|yrs?)/);
    if (match !== null) {
      const years = Number(match[1]);
      found = found === null ? years : Math.max(found, years);
    }
  }
  return found;
}

export function snippetAround(text: string, terms: string[], radius = 48): string | null {
  const lower = text.toLowerCase();
  for (const term of terms) {
    const needle = fold(term);
    if (needle.length < 3) {
      continue;
    }
    const index = lower.indexOf(needle);
    if (index >= 0) {
      const start = Math.max(0, index - radius);
      const end = Math.min(text.length, index + needle.length + radius);
      return text.slice(start, end).replace(/\s+/g, " ").trim();
    }
  }
  return null;
}
