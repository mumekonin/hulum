export const DEFAULT_INVESTIGATE_INTERVAL_MS = 30 * 60 * 1000;
export const DEFAULT_INVESTIGATE_START_DELAY_MS = 0;
/** Give the API time to answer the first page before Playwright starts. */
export const DEV_INVESTIGATE_START_DELAY_MS = 20_000;
export const DEFAULT_INVESTIGATE_STALE_AFTER_MS = 3 * 24 * 60 * 60 * 1000;
export const MIN_INVESTIGATE_INTERVAL_MS = 60_000;

export type InvestigateWorkerConfig = {
  enabled: boolean;
  intervalMs: number;
  onStart: boolean;
  startDelayMs: number;
  staleAfterMs: number;
  disabledReason?: string;
};

function optionalString(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }
  return value.trim();
}

function parseBoolean(value: string | undefined): boolean | undefined {
  const raw = optionalString(value)?.toLowerCase();
  if (raw === undefined) {
    return undefined;
  }
  if (raw === "true" || raw === "1" || raw === "on" || raw === "yes") {
    return true;
  }
  if (raw === "false" || raw === "0" || raw === "off" || raw === "no") {
    return false;
  }
  throw new Error("INVESTIGATE_WORKER and INVESTIGATE_ON_START must be true or false");
}

function parsePositiveInt(value: string | undefined, name: string): number | undefined {
  const raw = optionalString(value);
  if (raw === undefined) {
    return undefined;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

export function parseInvestigateWorkerConfig(input: {
  nodeEnv: "development" | "test" | "production";
  groqReady: boolean;
  env?: NodeJS.ProcessEnv;
}): InvestigateWorkerConfig {
  const env = input.env ?? process.env;
  const requested = parseBoolean(env.INVESTIGATE_WORKER);
  const onStart = parseBoolean(env.INVESTIGATE_ON_START) ?? true;

  const hours = parsePositiveInt(env.INVESTIGATE_INTERVAL_HOURS, "INVESTIGATE_INTERVAL_HOURS");
  const explicitMs = parsePositiveInt(env.INVESTIGATE_INTERVAL_MS, "INVESTIGATE_INTERVAL_MS");
  const intervalMs = Math.max(
    MIN_INVESTIGATE_INTERVAL_MS,
    explicitMs ?? (hours === undefined ? DEFAULT_INVESTIGATE_INTERVAL_MS : hours * 60 * 60 * 1000),
  );
  const startDelayMs =
    parsePositiveInt(env.INVESTIGATE_START_DELAY_MS, "INVESTIGATE_START_DELAY_MS") ??
    (input.nodeEnv === "development"
      ? DEV_INVESTIGATE_START_DELAY_MS
      : DEFAULT_INVESTIGATE_START_DELAY_MS);
  const staleAfterMs =
    parsePositiveInt(env.INVESTIGATE_STALE_AFTER_MS, "INVESTIGATE_STALE_AFTER_MS") ??
    DEFAULT_INVESTIGATE_STALE_AFTER_MS;

  if (requested === false) {
    return {
      enabled: false,
      intervalMs,
      onStart,
      startDelayMs,
      staleAfterMs,
      disabledReason: "INVESTIGATE_WORKER is false.",
    };
  }
  if (input.nodeEnv === "test" && requested !== true) {
    return {
      enabled: false,
      intervalMs,
      onStart,
      startDelayMs,
      staleAfterMs,
      disabledReason: "Investigate worker stays off while NODE_ENV=test.",
    };
  }
  if (!input.groqReady) {
    return {
      enabled: false,
      intervalMs,
      onStart,
      startDelayMs,
      staleAfterMs,
      disabledReason:
        "GROQ_API_KEY and GROQ_MODEL must be set for the investigator to extract listings.",
    };
  }

  return { enabled: true, intervalMs, onStart, startDelayMs, staleAfterMs };
}
