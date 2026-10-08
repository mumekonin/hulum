import {
  EDUCATION_LABELS,
  EDUCATION_LEVELS,
  type EducationLevel,
  type Opportunity,
  type Profile,
} from "@hulum/shared";
import { discover, EMPTY_FILTERS, type DiscoverFilters } from "./discover";
import {
  countryId,
  FIELD_BUCKETS,
  fold,
  locationLabel,
  passesRequirementFilters,
  type ExperienceFilter,
} from "./discover-filters";
import { daysUntil } from "./format";

export type SearchSuggestion = {
  id: string;
  label: string;
  query: string;
  filters: Partial<DiscoverFilters>;
};

function educationKey(value: string | null | undefined): EducationLevel | "" {
  if (value === null || value === undefined) return "";
  return (EDUCATION_LEVELS as readonly string[]).includes(value) ? (value as EducationLevel) : "";
}

/** Prefer a specific field bucket over the broader STEM grouping. */
export function fieldBucketFor(fieldOfStudy: string | null | undefined): string {
  const folded = fold(fieldOfStudy ?? "");
  if (folded === "") return "";
  const named = FIELD_BUCKETS.find((bucket) => bucket.id !== "stem" && bucket.test(folded));
  if (named !== undefined) return named.id;
  return FIELD_BUCKETS.find((bucket) => bucket.id === "stem" && bucket.test(folded))?.id ?? "";
}

function fieldLabel(fieldId: string, fallback: string): string {
  return FIELD_BUCKETS.find((bucket) => bucket.id === fieldId)?.label ?? fallback;
}

function suggestionHasMatches(all: Opportunity[], suggestion: SearchSuggestion): boolean {
  return (
    discover(all, suggestion.query, { ...EMPTY_FILTERS, ...suggestion.filters }).items.length > 0
  );
}

export function buildSearchSuggestions(
  all: Opportunity[],
  profile: Pick<Profile, "fieldOfStudy" | "country" | "educationLevel"> | null,
): SearchSuggestion[] {
  const field = fieldBucketFor(profile?.fieldOfStudy);
  const fieldName = fieldLabel(field, profile?.fieldOfStudy?.trim() ?? "");
  const location = profile?.country ? countryId(profile.country) : "";
  const locationName = location === "" ? "" : locationLabel(location);
  const education = educationKey(profile?.educationLevel ?? null);
  const educationName = education === "" ? "" : EDUCATION_LABELS[education];

  const candidates: SearchSuggestion[] = [];
  if (field !== "" && location !== "") {
    candidates.push({
      id: "field-location",
      label: `${fieldName} in ${locationName}`,
      query: "",
      filters: { field, location },
    });
  }
  if (education !== "" && location !== "") {
    candidates.push({
      id: "education-location",
      label: `${educationName} · ${locationName}`,
      query: "",
      filters: { education, location },
    });
  }
  if (field !== "") {
    candidates.push({
      id: "field-internships",
      label: `${fieldName} internships`,
      query: "",
      filters: { type: "internship", field },
    });
    candidates.push({
      id: "field-scholarships",
      label: `${fieldName} scholarships`,
      query: "",
      filters: { type: "scholarship", field, ...(location !== "" ? { location } : {}) },
    });
  }
  candidates.push(
    {
      id: "ethiopia-scholarships",
      label: "Scholarships in Ethiopia",
      query: "",
      filters: { type: "scholarship", location: "et" },
    },
    {
      id: "computer-science",
      label: "Computer science",
      query: "",
      filters: { field: "computer_science" },
    },
    {
      id: "internships",
      label: "Internships",
      query: "",
      filters: { type: "internship" },
    },
  );

  const picked: SearchSuggestion[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates) {
    if (seen.has(candidate.id) || !suggestionHasMatches(all, candidate)) continue;
    seen.add(candidate.id);
    picked.push(candidate);
    if (picked.length === 4) break;
  }
  return picked;
}

export function suggestionFiltersActive(
  current: DiscoverFilters,
  suggestion: SearchSuggestion,
): boolean {
  const next: DiscoverFilters = { ...EMPTY_FILTERS, ...suggestion.filters };
  return (
    current.type === next.type &&
    current.deadline === next.deadline &&
    current.location === next.location &&
    current.field === next.field &&
    current.education === next.education &&
    current.experience === next.experience &&
    current.includeClosed === next.includeClosed
  );
}

function isOpenListing(item: Opportunity): boolean {
  const remaining = daysUntil(item.deadline);
  return remaining === null || remaining >= 0;
}

/**
 * Stored listings that match the profile's field, country, and education.
 * This is a catalog filter, not decide() — it never claims APPLY / MAYBE / SKIP.
 */
export function suggestOpportunities(
  all: Opportunity[],
  profile: Pick<Profile, "fieldOfStudy" | "country" | "educationLevel"> | null,
  limit = 3,
): Opportunity[] {
  const open = all.filter(isOpenListing);
  const field = fieldBucketFor(profile?.fieldOfStudy);
  const location = profile?.country ? countryId(profile.country) : "";
  const education = educationKey(profile?.educationLevel ?? null);
  const experience: ExperienceFilter = "any";

  const passes = (filters: { field: string; location: string; education: string }): Opportunity[] =>
    open.filter((item) => passesRequirementFilters(item, { ...filters, experience }));

  const pools = [
    passes({ field, location, education }),
    passes({ field, location, education: "" }),
    passes({ field, location: "", education: "" }),
    passes({ field: "", location, education: "" }),
  ];
  const pool = pools.find((items) => items.length > 0) ?? [];
  return [...pool].sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, limit);
}

export function suggestionBasis(
  profile: Pick<Profile, "fieldOfStudy" | "country" | "educationLevel"> | null,
): string[] {
  if (profile === null) return [];
  const parts: string[] = [];
  const field = fieldBucketFor(profile.fieldOfStudy);
  if (field !== "") parts.push(fieldLabel(field, profile.fieldOfStudy ?? ""));
  else if (profile.fieldOfStudy?.trim()) parts.push(profile.fieldOfStudy.trim());
  const education = educationKey(profile.educationLevel);
  if (education !== "") parts.push(EDUCATION_LABELS[education]);
  if (profile.country?.trim()) parts.push(locationLabel(countryId(profile.country)));
  return parts;
}
