import { describe, expect, it } from "vitest";
import {
  canonicalEducation,
  countryEligible,
  educationMeets,
  fieldsOverlap,
  languageIds,
  parseEducationNeed,
  parseMinYears,
} from "./normalize.js";

describe("requirement normalize", () => {
  it("maps ET, Ethiopia, and Africa together", () => {
    expect(countryEligible("ET", ["Ethiopia"])).toBe(true);
    expect(countryEligible("Ethiopia", ["ET", "KE"])).toBe(true);
    expect(countryEligible("ET", ["Africa"])).toBe(true);
    expect(countryEligible("US", ["Africa"])).toBe(false);
  });

  it("maps university_student and catalog enrollment wording to a comparable education level", () => {
    expect(canonicalEducation("university_student")).toBe("bachelor_in_progress");
    expect(parseEducationNeed(["university_student"])).toEqual({
      kind: "min",
      level: "bachelor_in_progress",
      enrolledOk: true,
    });
    expect(parseEducationNeed(["Currently enrolled university student in computer science or a related field."])).toEqual({
      kind: "min",
      level: "bachelor_in_progress",
      enrolledOk: true,
    });
    expect(educationMeets("bachelor_in_progress", { kind: "min", level: "bachelor_in_progress", enrolledOk: true })).toBe(
      "met",
    );
    expect(educationMeets("high_school", { kind: "min", level: "bachelor_in_progress", enrolledOk: true })).toBe(
      "not_met",
    );
  });

  it("overlaps Computer Science with catalog STEM wording", () => {
    expect(fieldsOverlap("computer_science", ["Computer science, software engineering, or related STEM."])).toBe(true);
    expect(fieldsOverlap("Computer Science", ["computer_science"])).toBe(true);
    expect(fieldsOverlap("nursing", ["computer_science"])).toBe(false);
  });

  it("maps English and Amharic onto language codes", () => {
    expect(languageIds(["English", "Amharic"])).toEqual(["en", "am"]);
    expect(languageIds(["en"])).toEqual(["en"]);
  });

  it("parses a numeric year minimum", () => {
    expect(parseMinYears(["2 years of professional experience"])).toBe(2);
    expect(parseMinYears(["internships are helpful but not required"])).toBeNull();
  });
});
