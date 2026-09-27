import { describe, expect, it } from "vitest";
import {
  documentLabelCovers,
  extractPdfText,
  formatDocumentTextBag,
} from "./documentExtract.js";

describe("documentLabelCovers", () => {
  it("matches CV synonyms case-insensitively", () => {
    expect(documentLabelCovers(["Resume"], "CV")).toBe(true);
    expect(documentLabelCovers(["curriculum vitae"], "resume")).toBe(true);
    expect(documentLabelCovers(["CV"], "Motivation statement")).toBe(false);
  });

  it("matches transcript phrasing", () => {
    expect(documentLabelCovers(["Transcript"], "Academic transcripts")).toBe(true);
  });
});

describe("formatDocumentTextBag", () => {
  it("joins labeled extracts for the matcher", () => {
    expect(
      formatDocumentTextBag([
        { label: "CV", text: "Intern at Acme." },
        { label: "Transcript", text: "GPA 3.5" },
      ]),
    ).toBe("Label: CV\nIntern at Acme.\n---\nLabel: Transcript\nGPA 3.5");
  });
});

describe("extractPdfText", () => {
  it("returns empty for a non-PDF buffer without throwing", async () => {
    const result = await extractPdfText(Buffer.from("not a pdf"));
    expect(result.status === "empty" || result.status === "failed").toBe(true);
    expect(result.text).toBeNull();
  });
});
