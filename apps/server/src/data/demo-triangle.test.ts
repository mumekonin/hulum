import { Decision, type Profile } from "@hulum/shared";
import { describe, expect, it } from "vitest";
import { demoProfileInput, seedOpportunities } from "../data/seedOpportunities.js";
import { decide } from "../decision/decide.js";
import type { Clock } from "../services/common/clock.js";

/** Freeze clock inside the demo window so deadlines stay open in CI. */
const clock: Clock = {
  now: () => new Date("2026-09-24T12:00:00.000Z"),
};

function abebaProfile(): Profile {
  return {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    userId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    createdAt: "2026-09-18T00:00:00.000Z",
    updatedAt: "2026-09-18T00:00:00.000Z",
    educationLevel: demoProfileInput.educationLevel,
    fieldOfStudy: demoProfileInput.fieldOfStudy,
    graduationYear: demoProfileInput.graduationYear,
    country: demoProfileInput.country,
    city: demoProfileInput.city,
    languages: [...demoProfileInput.languages],
    skills: [...demoProfileInput.skills],
    experience: demoProfileInput.experience,
    yearsExperience: demoProfileInput.yearsExperience,
    interests: [...demoProfileInput.interests],
    documentsHeld: [...demoProfileInput.documentsHeld],
    preferredLanguage: demoProfileInput.preferredLanguage,
  };
}

function byTitle(pattern: RegExp) {
  const item = seedOpportunities.find((row) => pattern.test(row.title));
  if (!item) throw new Error(`seed missing opportunity matching ${pattern}`);
  return item;
}

describe("demo triangle seed fixture", () => {
  it("keeps Abeba → A2SV APPLY, UCT MAYBE, Chevening SKIP", () => {
    const profile = abebaProfile();
    const a2sv = byTitle(/a2sv/i);
    const uct = byTitle(/mastercard.*uct|uct.*mastercard/i);
    const chevening = byTitle(/chevening/i);

    expect(decide(profile, a2sv, clock).decision).toBe(Decision.APPLY);
    expect(decide(profile, uct, clock).decision).toBe(Decision.MAYBE);
    expect(decide(profile, chevening, clock).decision).toBe(Decision.SKIP);
  });
});
