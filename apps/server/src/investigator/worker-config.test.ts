import { describe, expect, it } from "vitest";
import {
  DEFAULT_INVESTIGATE_INTERVAL_MS,
  DEV_INVESTIGATE_START_DELAY_MS,
  MIN_INVESTIGATE_INTERVAL_MS,
  parseInvestigateWorkerConfig,
} from "./worker-config.js";

describe("parseInvestigateWorkerConfig", () => {
  it("defaults to a thirty-minute interval when Groq is ready", () => {
    const config = parseInvestigateWorkerConfig({
      nodeEnv: "development",
      groqReady: true,
      env: {},
    });
    expect(config.enabled).toBe(true);
    expect(config.intervalMs).toBe(DEFAULT_INVESTIGATE_INTERVAL_MS);
    expect(config.onStart).toBe(true);
    expect(config.startDelayMs).toBe(DEV_INVESTIGATE_START_DELAY_MS);
    expect(DEV_INVESTIGATE_START_DELAY_MS).toBe(20_000);
  });

  it("stays off in test unless explicitly enabled", () => {
    const config = parseInvestigateWorkerConfig({
      nodeEnv: "test",
      groqReady: true,
      env: {},
    });
    expect(config.enabled).toBe(false);
    expect(config.disabledReason).toMatch(/NODE_ENV=test/);
  });

  it("stays off without Groq instead of inventing listings", () => {
    const config = parseInvestigateWorkerConfig({
      nodeEnv: "production",
      groqReady: false,
      env: {},
    });
    expect(config.enabled).toBe(false);
    expect(config.disabledReason).toMatch(/GROQ_API_KEY/);
  });

  it("honors INVESTIGATE_INTERVAL_HOURS and a hard off switch", () => {
    const hours = parseInvestigateWorkerConfig({
      nodeEnv: "production",
      groqReady: true,
      env: { INVESTIGATE_INTERVAL_HOURS: "2" },
    });
    expect(hours.intervalMs).toBe(2 * 60 * 60 * 1000);

    const off = parseInvestigateWorkerConfig({
      nodeEnv: "production",
      groqReady: true,
      env: { INVESTIGATE_WORKER: "false" },
    });
    expect(off.enabled).toBe(false);
  });

  it("does not allow an interval under one minute", () => {
    const config = parseInvestigateWorkerConfig({
      nodeEnv: "development",
      groqReady: true,
      env: { INVESTIGATE_INTERVAL_MS: "100" },
    });
    expect(config.intervalMs).toBe(MIN_INVESTIGATE_INTERVAL_MS);
  });
});
