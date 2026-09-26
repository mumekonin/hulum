import { detectAskedLanguage } from "@hulum/shared";
import { describe, expect, it } from "vitest";

describe("detectAskedLanguage", () => {
  it("detects Amharic from Ge'ez script", () => {
    expect(detectAskedLanguage("\u12dd\u122d\u12dd\u122d \u1295\u1308\u1228\u129d", "en")).toBe("am");
  });

  it("detects Afaan Oromo from Latin markers", () => {
    expect(detectAskedLanguage("scholarshipwwan natti agarsiisi", "en")).toBe("om");
    expect(detectAskedLanguage("carraa kana ibsi", "en")).toBe("om");
  });

  it("uses English when the utterance is clearly English", () => {
    expect(detectAskedLanguage("show me scholarship and analysis", "om")).toBe("en");
    expect(detectAskedLanguage("tell me the details", "am")).toBe("en");
  });

  it("falls back when the utterance has no language markers", () => {
    expect(detectAskedLanguage("ok", "am")).toBe("am");
    expect(detectAskedLanguage("", "om")).toBe("om");
  });
});
