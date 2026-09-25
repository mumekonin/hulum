import { describe, expect, it } from "vitest";
import { assertSafeHttpUrl, isAllowedOfficialUrl, isBlockedHost } from "./safety.js";

describe("investigator safety", () => {
  it("blocks localhost and private IPs", () => {
    expect(isBlockedHost("localhost")).toBe(true);
    expect(isBlockedHost("127.0.0.1")).toBe(true);
    expect(isBlockedHost("10.0.0.2")).toBe(true);
    expect(isBlockedHost("192.168.1.4")).toBe(true);
    expect(isBlockedHost("169.254.1.1")).toBe(true);
    expect(isBlockedHost("hetriil.moe.gov.et")).toBe(false);
  });

  it("rejects credentialed or non-http URLs", () => {
    expect(() => assertSafeHttpUrl("http://user:pass@hetriil.moe.gov.et/")).toThrow(/credentials/);
    expect(() => assertSafeHttpUrl("file:///etc/passwd")).toThrow(/http/);
  });

  it("allow-lists known official hosts when asked", () => {
    const official = ["hetriil.moe.gov.et"];
    expect(isAllowedOfficialUrl("https://hetriil.moe.gov.et/internships", official)).toBe(true);
    expect(isAllowedOfficialUrl("https://scholarship.et/some-listing", official)).toBe(false);
  });
});
