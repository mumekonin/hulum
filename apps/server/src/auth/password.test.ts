import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password.js";

describe("password hashing", () => {
  it("round-trips a password", async () => {
    const stored = await hashPassword("correct-horse");
    expect(stored.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("correct-horse", stored)).toBe(true);
    expect(await verifyPassword("wrong-password", stored)).toBe(false);
  });

  it("rejects short passwords", async () => {
    await expect(hashPassword("short")).rejects.toThrow(/at least 8/);
  });

  it("rejects a malformed stored hash", async () => {
    expect(await verifyPassword("correct-horse", "not-a-hash")).toBe(false);
  });
});
