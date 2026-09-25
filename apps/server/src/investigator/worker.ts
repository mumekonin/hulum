import type { AppEnv } from "../config/env.js";
import { markStaleExtracts } from "./store.js";
import { runInvestigation, type InvestigationSummary } from "./run.js";
import {
  parseInvestigateWorkerConfig,
  type InvestigateWorkerConfig,
} from "./worker-config.js";

export type InvestigateWorker = {
  start: () => void;
  stop: () => void;
  runOnce: () => Promise<void>;
  isBusy: () => boolean;
};

export type InvestigateWorkerDeps = {
  env: AppEnv;
  config?: InvestigateWorkerConfig;
  investigate?: (env: AppEnv, now?: Date) => Promise<InvestigationSummary>;
  markStale?: (cutoff: Date) => Promise<number>;
  now?: () => Date;
  log?: (message: string) => void;
  setTimeoutFn?: typeof setTimeout;
  setIntervalFn?: typeof setInterval;
  clearTimeoutFn?: typeof clearTimeout;
  clearIntervalFn?: typeof clearInterval;
};

function defaultConfig(env: AppEnv): InvestigateWorkerConfig {
  return parseInvestigateWorkerConfig({
    nodeEnv: env.NODE_ENV,
    groqReady: env.GROQ_API_KEY !== undefined && env.GROQ_MODEL !== undefined,
  });
}

/**
 * Periodic catalog refresh. Calls the same runInvestigation() as POST /api/investigate.
 * Never invents listings. Overlapping ticks are skipped.
 */
export function createInvestigateWorker(deps: InvestigateWorkerDeps): InvestigateWorker {
  const config = deps.config ?? defaultConfig(deps.env);
  const investigate = deps.investigate ?? runInvestigation;
  const markStale = deps.markStale ?? markStaleExtracts;
  const nowFn = deps.now ?? (() => new Date());
  const log = deps.log ?? ((message: string) => console.log(message));
  const setTimeoutFn = deps.setTimeoutFn ?? setTimeout;
  const setIntervalFn = deps.setIntervalFn ?? setInterval;
  const clearTimeoutFn = deps.clearTimeoutFn ?? clearTimeout;
  const clearIntervalFn = deps.clearIntervalFn ?? clearInterval;

  let busy = false;
  let delayHandle: ReturnType<typeof setTimeout> | undefined;
  let intervalHandle: ReturnType<typeof setInterval> | undefined;

  async function runOnce(): Promise<void> {
    if (busy) {
      log("Investigate worker skipped: previous run still in progress.");
      return;
    }
    busy = true;
    try {
      const now = nowFn();
      const summary = await investigate(deps.env, now);
      const stale = await markStale(new Date(now.getTime() - config.staleAfterMs));
      log(
        `Investigate worker finished checked=${String(summary.checked)} saved=${String(summary.saved)} refreshed=${String(summary.refreshed ?? 0)} rejected=${String(summary.rejected)} stale=${String(stale)}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Investigate worker failed.";
      log(`Investigate worker failed: ${message}`);
    } finally {
      busy = false;
    }
  }

  function start(): void {
    if (!config.enabled) {
      log(`Investigate worker off. ${config.disabledReason ?? "Disabled."}`);
      return;
    }
    log(
      `Investigate worker on. intervalMs=${String(config.intervalMs)} onStart=${String(config.onStart)} budgetMs=15000`,
    );
    if (config.onStart) {
      delayHandle = setTimeoutFn(() => {
        void runOnce();
      }, config.startDelayMs);
    }
    intervalHandle = setIntervalFn(() => {
      void runOnce();
    }, config.intervalMs);
    intervalHandle.unref?.();
    delayHandle?.unref?.();
  }

  function stop(): void {
    if (delayHandle !== undefined) {
      clearTimeoutFn(delayHandle);
      delayHandle = undefined;
    }
    if (intervalHandle !== undefined) {
      clearIntervalFn(intervalHandle);
      intervalHandle = undefined;
    }
  }

  return {
    start,
    stop,
    runOnce,
    isBusy: () => busy,
  };
}

export function startInvestigateWorker(env: AppEnv): InvestigateWorker {
  const worker = createInvestigateWorker({ env });
  worker.start();
  return worker;
}
