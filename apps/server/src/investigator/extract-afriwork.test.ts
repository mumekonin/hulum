import { describe, expect, it } from "vitest";
import { extractAfriworkJob } from "./extract-afriwork.js";

const url = "https://afriworket.com/jobs/01e900b9-670d-41ff-968b-f041b2a1059c";
const page =
  "Software Development Private Client Software Design & Development Posted August 23, 2026 from Anywhere/Remote in Ethiopia Job Type: Remote - Contractual Deadline: December 31, 2026 Applicants Needed: Both INTERMEDIATE Experience Level Skills And Expertise Software Development Private Client Jobs Posted: 18";

describe("extractAfriworkJob", () => {
  it("reads title, employer, deadline, and requirement from the job page", () => {
    const row = extractAfriworkJob(page, url);
    expect(row?.title).toBe("Software Development");
    expect(row?.organization).toBe("Private Client");
    expect(row?.type).toBe("job");
    expect(row?.deadline).toBe("2026-12-31");
    expect(row?.deadlineEvidence).toMatch(/Deadline: December 31, 2026/i);
    expect(row?.requirementEvidence).toMatch(/Applicants Needed: Both/i);
    expect(row?.officialSourceUrl).toBe(url);
  });

  it("returns nothing when the deadline sentence is missing", () => {
    expect(extractAfriworkJob("Software Development Private Client Posted August 23, 2026", url)).toBeUndefined();
  });

  it("returns nothing for a non-Afriwork URL", () => {
    expect(extractAfriworkJob(page, "https://scholarship.et/scholarships/x")).toBeUndefined();
  });
});
