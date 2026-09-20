import { describe, expect, it } from "vitest";
import { parseClientUrl } from "./env.js";

describe("parseClientUrl", () => {
  it("normalizes an http origin", () => {
    expect(parseClientUrl("http://localhost:3000")).toBe("http://localhost:3000");
  });

  it("rejects a path or credentials", () => {
    expect(() => parseClientUrl("http://localhost:3000/app")).toThrow(/origin only/);
    expect(() => parseClientUrl("http://user:pass@localhost:3000")).toThrow(/credentials/);
  });

  it("treats empty as unset", () => {
    expect(parseClientUrl(undefined)).toBeUndefined();
    expect(parseClientUrl("  ")).toBeUndefined();
  });
});
