import { profileCompleteness, type Profile } from "@hulum/shared";
import { describe, expect, it } from "vitest";

const base: Profile = {
  id: "22222222-2222-4222-8222-222222222222",
  userId: "11111111-1111-4111-8111-111111111111",
  educationLevel: null,
  fieldOfStudy: null,
  graduationYear: null,
  country: null,
  city: null,
  languages: [],
  skills: [],
  experience: null,
  interests: [],
  createdAt: "2026-09-19T00:00:00.000Z",
  updatedAt: "2026-09-19T00:00:00.000Z",
};

describe("profileCompleteness", () => {
  it("lists every empty field as missing", () => {
    const result = profileCompleteness(base);
    expect(result.complete).toBe(false);
    expect(result.missing).toContain("educationLevel");
    expect(result.missing).toContain("languages");
  });

  it("is complete when analysis-ready fields are present", () => {
    const result = profileCompleteness({
      ...base,
      educationLevel: "university_student",
      fieldOfStudy: "computer_science",
      graduationYear: 2027,
      country: "ET",
      city: "Addis Ababa",
      languages: ["en", "am"],
      skills: ["python"],
      experience: "1 internship",
      interests: ["ai"],
    });
    expect(result).toEqual({ complete: true, missing: [] });
  });
});
