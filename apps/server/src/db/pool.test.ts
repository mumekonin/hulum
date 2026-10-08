import { describe, expect, it } from "vitest";
import { connectTimeoutMs } from "./pool.js";

describe("connectTimeoutMs", () => {
  it("defaults to 5 seconds when empty or invalid", () => {
    expect(connectTimeoutMs("")).toBe(5_000);
    expect(connectTimeoutMs("soon")).toBe(5_000);
    expect(connectTimeoutMs("-1")).toBe(5_000);
    expect(connectTimeoutMs("2.5")).toBe(5_000);
  });

  it("uses a positive whole number of milliseconds", () => {
    expect(connectTimeoutMs("30000")).toBe(30_000);
  });
});
