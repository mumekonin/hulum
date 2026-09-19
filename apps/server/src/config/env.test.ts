import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadEnv } from "./env.js";

const KEYS = ["NODE_ENV", "PORT", "CLIENT_URL"] as const;

describe("loadEnv", () => {
  const previous: Partial<Record<(typeof KEYS)[number], string | undefined>> = {};

  beforeEach(() => {
    for (const key of KEYS) {
      previous[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of KEYS) {
      const value = previous[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("defaults PORT to 4000 outside production", () => {
    const env = loadEnv({ fromFile: false });
    expect(env.NODE_ENV).toBe("development");
    expect(env.PORT).toBe(4000);
    expect(env.CLIENT_URL).toBeUndefined();
  });

  it("requires a CLIENT_URL origin in production", () => {
    process.env.NODE_ENV = "production";
    expect(() => loadEnv({ fromFile: false })).toThrow(/CLIENT_URL is required in production/);

    process.env.CLIENT_URL = "not-a-url";
    expect(() => loadEnv({ fromFile: false })).toThrow(/http\(s\) origin/);

    process.env.CLIENT_URL = "https://hulum.example/app";
    expect(() => loadEnv({ fromFile: false })).toThrow(/origin only/);

    process.env.CLIENT_URL = "https://hulum.example";
    const env = loadEnv({ fromFile: false });
    expect(env.NODE_ENV).toBe("production");
    expect(env.CLIENT_URL).toBe("https://hulum.example");
  });
});
