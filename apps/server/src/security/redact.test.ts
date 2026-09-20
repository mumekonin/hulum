import { describe, expect, it } from "vitest";
import { redactSecrets } from "./redact.js";

describe("redactSecrets", () => {
  it("removes connection strings, bearer tokens, and Groq-shaped keys", () => {
    const raw =
      "connect postgres://user:pass@db.example.invalid/hulum Bearer gsk_liveabc123 and eyJhbGciOiJIUzI1NiJ9.aaaa.bbbb";
    const redacted = redactSecrets(raw);
    expect(redacted.includes("postgres://")).toBe(false);
    expect(redacted.includes("gsk_")).toBe(false);
    expect(redacted.includes("Bearer gsk_")).toBe(false);
    expect(redacted.includes("eyJhbGciOiJIUzI1NiJ9")).toBe(false);
    expect(redacted.includes("[redacted]")).toBe(true);
  });

  it("does not treat the Voxide publishable prefix as a secret", () => {
    expect(redactSecrets("publicKey=vox_pub_demo")).toBe("publicKey=vox_pub_demo");
  });
});
