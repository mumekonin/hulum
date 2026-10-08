import { describe, expect, it, vi } from "vitest";
import type { AppEnv } from "../config/env.js";
import { createInvestigateWorker } from "./worker.js";

const env: AppEnv = {
  NODE_ENV: "development",
  PORT: 3001,
  CLIENT_URL: undefined,
  DATABASE_URL: undefined,
  SUPABASE_URL: undefined,
  SUPABASE_ANON_KEY: undefined,
  SUPABASE_SERVICE_ROLE_KEY: undefined,
  CLAUDE_API_KEY: undefined,
  CLAUDE_MODEL: undefined,
  GROQ_API_KEY: "test-key",
  GROQ_MODEL: "test-model",
  GROQ_VISION_MODEL: undefined,
  VOXIDE_API_KEY: undefined,
  JOB_OPPORTUNITIES_API_KEY: undefined,
  JOB_OPPORTUNITIES_API_URL: undefined,
  INVESTIGATE_ADMIN_SECRET: undefined,
  SCHOLARXIV_API_KEY: undefined,
  SESSION_SECRET: undefined,
  GOOGLE_CLIENT_ID: undefined,
  GOOGLE_CLIENT_SECRET: undefined,
};

const withoutDatabase = <T>(fn: () => Promise<T>): Promise<T> => fn();

describe("investigate worker", () => {
  it("skips a tick while a run is in progress", async () => {
    let release: (() => void) | undefined;
    const investigate = vi.fn(
      () =>
        new Promise<{
          runId: string;
          checked: number;
          saved: number;
          rejected: number;
          refreshed: number;
          notes: string[];
        }>((resolve) => {
          release = () =>
            resolve({ runId: "run-1", checked: 1, saved: 0, rejected: 0, refreshed: 1, notes: [] });
        }),
    );
    const markStale = vi.fn(async () => 0);
    const logs: string[] = [];
    const worker = createInvestigateWorker({
      env,
      config: {
        enabled: true,
        intervalMs: 60_000,
        onStart: false,
        startDelayMs: 0,
        staleAfterMs: 3 * 24 * 60 * 60 * 1000,
      },
      investigate,
      markStale,
      withRls: withoutDatabase,
      log: (message) => logs.push(message),
    });

    const first = worker.runOnce();
    await worker.runOnce();
    expect(investigate).toHaveBeenCalledTimes(1);
    expect(logs.some((line) => line.includes("previous run still in progress"))).toBe(true);
    release?.();
    await first;
    expect(markStale).toHaveBeenCalledTimes(1);
  });

  it("marks stale AI-extracted rows after a successful run", async () => {
    const now = new Date("2026-09-24T20:00:00.000Z");
    const markStale = vi.fn(async () => 2);
    const worker = createInvestigateWorker({
      env,
      config: {
        enabled: true,
        intervalMs: 60_000,
        onStart: false,
        startDelayMs: 0,
        staleAfterMs: 72 * 60 * 60 * 1000,
      },
      investigate: async () => ({
        runId: "run-2",
        checked: 3,
        saved: 1,
        rejected: 0,
        refreshed: 2,
        notes: [],
      }),
      markStale,
      withRls: withoutDatabase,
      now: () => now,
      log: () => undefined,
    });

    await worker.runOnce();
    expect(markStale).toHaveBeenCalledWith(new Date("2026-09-21T20:00:00.000Z"));
  });

  it("does not schedule when disabled", () => {
    const setIntervalFn = vi.fn();
    const worker = createInvestigateWorker({
      env,
      config: {
        enabled: false,
        intervalMs: 60_000,
        onStart: true,
        startDelayMs: 10,
        staleAfterMs: 1,
        disabledReason: "off",
      },
      setIntervalFn: setIntervalFn as unknown as typeof setInterval,
      log: () => undefined,
    });
    worker.start();
    expect(setIntervalFn).not.toHaveBeenCalled();
    worker.stop();
  });
});
