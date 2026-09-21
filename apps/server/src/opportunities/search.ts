import { TYPE_LABELS, type Opportunity, type OpportunityType } from "@hulum/shared";

export function matchesOpportunityQuery(item: Opportunity, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    item.title,
    item.organization,
    item.description,
    item.type,
    TYPE_LABELS[item.type],
    item.countryEligibility.join(" "),
    Array.isArray(item.fieldRequirements)
      ? item.fieldRequirements.join(" ")
      : item.fieldRequirements,
    Array.isArray(item.educationRequirements)
      ? item.educationRequirements.join(" ")
      : item.educationRequirements,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

export function filterOpportunities(
  items: Opportunity[],
  options: { type?: OpportunityType; q?: string },
): Opportunity[] {
  return items.filter((item) => {
    if (options.type && item.type !== options.type) return false;
    if (options.q && !matchesOpportunityQuery(item, options.q)) return false;
    return true;
  });
}
