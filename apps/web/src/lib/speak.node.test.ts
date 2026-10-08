import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { voiceForLocale } from "./speak";

describe("voiceForLocale", () => {
  it("uses the system default when both a male and a female voice are installed", () => {
    const chosen = voiceForLocale("en-US", [
      { lang: "en-US", name: "Microsoft Zira", default: false },
      { lang: "en-US", name: "Microsoft David", default: true },
      { lang: "fr-FR", name: "Microsoft Hortense", default: true },
    ]);
    assert.equal(chosen?.name, "Microsoft David");
  });

  it("falls back to the first voice for that language", () => {
    const chosen = voiceForLocale("am-ET", [
      { lang: "en-US", name: "David" },
      { lang: "am-ET", name: "Amharic" },
    ]);
    assert.equal(chosen?.name, "Amharic");
  });
});
