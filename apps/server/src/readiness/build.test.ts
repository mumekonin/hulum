import {
  RequirementKey,
  RequirementStatus,
  ReadinessStatus,
  type RequirementMatch,
} from "@hulum/shared";
import { describe, expect, it } from "vitest";
import { buildReadinessItems } from "./build.js";

function match(
  key: RequirementMatch["key"],
  status: RequirementMatch["status"],
  text: string,
): RequirementMatch {
  return {
    key,
    text,
    status,
    evidence: null,
    reason: `${key} is ${status}`,
  };
}

const complete: RequirementMatch[] = [
  match(RequirementKey.COUNTRY, RequirementStatus.MET, "ET"),
  match(RequirementKey.EDUCATION, RequirementStatus.MET, "university_student"),
  match(RequirementKey.FIELD, RequirementStatus.MET, "computer_science"),
  match(RequirementKey.LANGUAGE, RequirementStatus.MET, "en"),
  match(RequirementKey.EXPERIENCE, RequirementStatus.NOT_APPLICABLE, "Experience requirement"),
  match(RequirementKey.DOCUMENTS, RequirementStatus.NOT_APPLICABLE, "Document requirement"),
  match(RequirementKey.DEADLINE, RequirementStatus.MET, "Deadline 2026-12-31"),
  match(RequirementKey.OTHER, RequirementStatus.NOT_APPLICABLE, "Other requirements"),
];

describe("buildReadinessItems", () => {
  it("marks unused documents as NOT_REQUIRED when none are listed", () => {
    const items = buildReadinessItems(complete);
    expect(items).toEqual([
      {
        title: "No extra documents listed",
        description: "documents is NOT_APPLICABLE",
        status: ReadinessStatus.NOT_REQUIRED,
        priority: 1,
      },
    ]);
  });

  it("creates a TODO for each listed document", () => {
    const matches = complete.map((item) =>
      item.key === RequirementKey.DOCUMENTS
        ? match(RequirementKey.DOCUMENTS, RequirementStatus.UNCERTAIN, "cv, transcript")
        : item,
    );
    const items = buildReadinessItems(matches);
    expect(items.map((item) => item.title)).toEqual(["Prepare cv", "Prepare transcript"]);
    expect(items.every((item) => item.status === ReadinessStatus.TODO)).toBe(true);
  });

  it("creates a TODO for a missing country requirement", () => {
    const matches = complete.map((item) =>
      item.key === RequirementKey.COUNTRY
        ? match(RequirementKey.COUNTRY, RequirementStatus.NOT_MET, "US")
        : item,
    );
    const items = buildReadinessItems(matches);
    expect(items.some((item) => item.title === "Resolve the country requirement")).toBe(true);
  });

  it("creates a TODO when experience is uncertain", () => {
    const matches = complete.map((item) =>
      item.key === RequirementKey.EXPERIENCE
        ? match(RequirementKey.EXPERIENCE, RequirementStatus.UNCERTAIN, "2 years")
        : item,
    );
    const items = buildReadinessItems(matches);
    expect(items.some((item) => item.title === "Resolve the experience requirement")).toBe(true);
  });

  it("returns the same checklist for the same matches", () => {
    const matches = complete.map((item) =>
      item.key === RequirementKey.DOCUMENTS
        ? match(RequirementKey.DOCUMENTS, RequirementStatus.UNCERTAIN, "cv")
        : item,
    );
    expect(buildReadinessItems(matches)).toEqual(buildReadinessItems(matches));
  });
});
