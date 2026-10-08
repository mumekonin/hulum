import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Opportunity } from "@hulum/shared";
import { catalogLabel, countryId } from "./discover-filters";
import { discover, EMPTY_FILTERS, filterOptions } from "./discover";
import {
  buildSearchSuggestions,
  fieldBucketFor,
  suggestOpportunities,
  suggestionBasis,
} from "./discover-suggestions";

function sample(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "opp-cs",
    title: "CS Fellowship",
    organization: "Example Org",
    type: "fellowship",
    description: "Software engineering training for African students.",
    deadline: "2027-12-31",
    countryEligibility: ["ET"],
    educationRequirements: ["university_student"],
    fieldRequirements: ["computer_science"],
    experienceRequirements: [],
    languageRequirements: ["English"],
    documentRequirements: [],
    otherRequirements: [],
    applicationUrl: "https://example.org",
    sourceUrl: "https://example.org",
    sourceType: "official_organization",
    verificationStatus: "VERIFIED",
    lastVerifiedAt: "2026-09-18T00:00:00.000Z",
    createdAt: "2026-09-18T00:00:00.000Z",
    updatedAt: "2026-09-18T00:00:00.000Z",
    ...overrides,
  };
}

const catalog = [
  sample(),
  sample({
    id: "opp-africa-open",
    title: "Africa Open Scholarship",
    type: "scholarship",
    countryEligibility: ["Africa"],
    educationRequirements: "Undergraduate degree that will enable a UK master's offer.",
    fieldRequirements: "Any subject with a UK university offer.",
    experienceRequirements: "At least two years' work experience (typical Chevening rule).",
  }),
  sample({
    id: "opp-kenya-job",
    title: "Nairobi engineering role",
    type: "job",
    countryEligibility: ["KE"],
    educationRequirements: ["bachelor"],
    fieldRequirements: ["engineering"],
    experienceRequirements: ["3+ years"],
  }),
  sample({
    id: "opp-closed",
    title: "Closed CS internship",
    type: "internship",
    deadline: "2020-01-01",
    countryEligibility: ["Ethiopia"],
    educationRequirements: "Currently enrolled university student",
    fieldRequirements: "Computer science, software engineering, or related STEM.",
    experienceRequirements: "Internships are helpful but not required.",
  }),
  sample({
    id: "opp-leadership",
    title: "Leadership fellowship",
    type: "fellowship",
    countryEligibility: ["Africa"],
    educationRequirements:
      "Emerging leaders; university study is common but not always the only path.",
    fieldRequirements:
      "Leadership across civic, public, and business tracks — not limited to computer science.",
    experienceRequirements: "Demonstrated leadership or community impact.",
  }),
  sample({
    id: "opp-lawyer-job",
    title: "Lawyer",
    type: "job",
    countryEligibility: ["ET"],
    educationRequirements: [],
    fieldRequirements: [],
    experienceRequirements: [],
  }),
  sample({
    id: "opp-junior-architect",
    title: "Junior Architect",
    type: "job",
    countryEligibility: ["Ethiopia"],
    educationRequirements: [],
    fieldRequirements: [],
    experienceRequirements: [],
  }),
  sample({
    id: "opp-doctoral",
    title: "Doctoral Scholarships in Germany",
    type: "scholarship",
    countryEligibility: ["Germany"],
    educationRequirements: [],
    fieldRequirements: [],
    experienceRequirements: [],
  }),
  sample({
    id: "opp-global",
    title: "Worldwide open scholarship",
    type: "scholarship",
    countryEligibility: ["any"],
    educationRequirements: [],
    fieldRequirements: ["Any subject with a UK university offer."],
    experienceRequirements: [],
  }),
  sample({
    id: "opp-usa",
    title: "US campus scholarship",
    type: "scholarship",
    countryEligibility: ["USA"],
  }),
  sample({
    id: "opp-united-states",
    title: "United States campus scholarship",
    type: "scholarship",
    countryEligibility: ["United States"],
  }),
];

function ids(query: string, filters: Partial<typeof EMPTY_FILTERS> = {}): string[] {
  return discover(catalog, query, { ...EMPTY_FILTERS, ...filters, includeClosed: true }).items.map(
    (item) => item.id,
  );
}

describe("discover filters", () => {
  it("maps country aliases onto one Ethiopia option", () => {
    assert.equal(countryId("ET"), "et");
    assert.equal(countryId("Ethiopia"), "et");
    assert.equal(countryId("ethiopian"), "et");
    assert.equal(countryId("Algeria"), "dz");
    assert.equal(countryId("Zimbabwe"), "zw");
    assert.equal(countryId("Cote d'Ivoire"), "ci");
    const locations = filterOptions(catalog).locations.map((option) => option.label);
    assert.deepEqual(
      locations.filter((label) => label === "Ethiopia"),
      ["Ethiopia"],
    );
    assert.ok(!locations.includes("ET"));
    assert.ok(locations.filter((label) => label === "United States").length === 1);
    assert.ok(locations.includes("Global / any country"));
    assert.ok(!locations.includes("USA"));
    assert.ok(!locations.includes("any"));
  });

  it("shows human field, education, and experience subcategories", () => {
    const options = filterOptions(catalog);
    assert.ok(
      options.fields.some(
        (option) => option.value === "computer_science" && option.label === "Computer science",
      ),
    );
    assert.ok(!options.fields.some((option) => option.label === "computer_science"));
    assert.ok(
      options.education.some(
        (option) =>
          option.value === "bachelor_in_progress" && option.label === "Bachelor's (in progress)",
      ),
    );
    assert.ok(
      options.education.some(
        (option) => option.value === "bachelor" && option.label === "Bachelor's (completed)",
      ),
    );
    assert.ok(
      options.experience.some(
        (option) => option.value === "years_2" && option.label === "About 2 years",
      ),
    );
    assert.ok(options.experience.some((option) => option.value === "intern"));
    assert.equal(catalogLabel("computer_science"), "Computer Science");
    assert.equal(catalogLabel("university_student"), "Bachelor's (in progress)");
    assert.equal(catalogLabel("ET"), "Ethiopia");
    assert.equal(catalogLabel("USA"), "United States");
  });

  it("matches field slugs, prose, STEM subcategories, and open-field listings", () => {
    const cs = ids("", { field: "computer_science" });
    assert.ok(cs.includes("opp-cs"));
    assert.ok(cs.includes("opp-closed"));
    assert.ok(cs.includes("opp-africa-open"));
    assert.ok(cs.includes("opp-leadership"));
    assert.ok(!cs.includes("opp-kenya-job"));

    const engineering = ids("", { field: "engineering" });
    assert.ok(engineering.includes("opp-kenya-job"));
    assert.ok(engineering.includes("opp-closed"));
    assert.ok(!engineering.includes("opp-cs"));

    const law = ids("", { field: "law" });
    assert.ok(law.includes("opp-lawyer-job"));
    const architecture = ids("", { field: "engineering" });
    assert.ok(architecture.includes("opp-junior-architect"));

    const stem = ids("", { field: "stem" });
    assert.ok(stem.includes("opp-closed"));
    assert.ok(stem.includes("opp-cs"));
  });

  it("matches education levels from slugs and prose", () => {
    const inProgress = ids("", { education: "bachelor_in_progress" });
    assert.ok(inProgress.includes("opp-cs"));
    assert.ok(inProgress.includes("opp-closed"));
    assert.ok(!inProgress.includes("opp-kenya-job"));

    const bachelor = ids("", { education: "bachelor" });
    assert.ok(bachelor.includes("opp-kenya-job"));
    assert.ok(bachelor.includes("opp-africa-open"));
    assert.ok(!bachelor.includes("opp-cs"));

    const phd = ids("", { education: "phd" });
    assert.ok(phd.includes("opp-doctoral"));
  });

  it("matches experience subcategories", () => {
    assert.ok(ids("", { experience: "none" }).includes("opp-cs"));
    assert.ok(!ids("", { experience: "none" }).includes("opp-africa-open"));
    assert.ok(ids("", { experience: "years_2" }).includes("opp-africa-open"));
    assert.ok(!ids("", { experience: "years_2" }).includes("opp-kenya-job"));
    assert.ok(ids("", { experience: "years_3_plus" }).includes("opp-kenya-job"));
    assert.ok(ids("", { experience: "junior" }).includes("opp-junior-architect"));
    assert.ok(ids("", { experience: "intern" }).includes("opp-closed"));
    assert.ok(!ids("", { experience: "intern" }).includes("opp-leadership"));
    assert.ok(ids("", { experience: "not_required" }).includes("opp-closed"));
    assert.ok(ids("", { experience: "leadership" }).includes("opp-leadership"));
    assert.ok(ids("", { experience: "listed" }).includes("opp-africa-open"));
    assert.ok(!ids("", { experience: "listed" }).includes("opp-cs"));
  });

  it("treats Africa-eligible listings as matching Ethiopia, not Kenya-only jobs", () => {
    const ethiopia = ids("", { location: "et" });
    assert.ok(ethiopia.includes("opp-cs"));
    assert.ok(ethiopia.includes("opp-africa-open"));
    assert.ok(ethiopia.includes("opp-closed"));
    assert.ok(ethiopia.includes("opp-global"));
    assert.ok(!ethiopia.includes("opp-kenya-job"));
    assert.ok(!ethiopia.includes("opp-usa"));

    const kenya = ids("", { location: "ke" });
    assert.ok(kenya.includes("opp-kenya-job"));
    assert.ok(kenya.includes("opp-africa-open"));
    assert.ok(!kenya.includes("opp-cs"));
  });

  it("still hides closed deadlines unless asked, and type chips still work", () => {
    const open = discover(catalog, "", EMPTY_FILTERS).items.map((item) => item.id);
    assert.ok(!open.includes("opp-closed"));
    const withClosed = discover(catalog, "", { ...EMPTY_FILTERS, includeClosed: true }).items.map(
      (item) => item.id,
    );
    assert.ok(withClosed.includes("opp-closed"));
    const jobs = ids("", { type: "job" });
    assert.ok(jobs.includes("opp-kenya-job"));
    assert.ok(jobs.includes("opp-lawyer-job"));
    assert.ok(!jobs.includes("opp-cs"));
  });
});

describe("discover suggestions", () => {
  const profile = {
    fieldOfStudy: "Computer Science",
    country: "Ethiopia",
    educationLevel: "bachelor_in_progress",
  };

  it("maps a profile field onto a labeled field bucket", () => {
    assert.equal(fieldBucketFor("Computer Science"), "computer_science");
    assert.equal(fieldBucketFor("software engineering"), "computer_science");
    assert.deepEqual(suggestionBasis(profile), [
      "Computer science",
      "Bachelor's (in progress)",
      "Ethiopia",
    ]);
  });

  it("suggests searches that already have stored matches", () => {
    const suggestions = buildSearchSuggestions(catalog, profile);
    assert.ok(suggestions.length > 0);
    assert.ok(
      suggestions.every(
        (item) => item.label !== item.label.toLowerCase() || item.label.includes("science"),
      ),
    );
    assert.ok(suggestions.some((item) => item.label.includes("Computer science")));
    assert.ok(!suggestions.some((item) => item.label.includes("computer_science")));
    for (const suggestion of suggestions) {
      assert.ok(
        discover(catalog, suggestion.query, { ...EMPTY_FILTERS, ...suggestion.filters }).items
          .length > 0,
      );
    }
  });

  it("suggests open catalog listings that match the profile, not closed ones", () => {
    const suggested = suggestOpportunities(catalog, profile, 3);
    assert.ok(suggested.some((item) => item.id === "opp-cs"));
    assert.ok(!suggested.some((item) => item.id === "opp-closed"));
    assert.ok(suggested.length <= 3);
  });
});
