/**
 * In-process latency/error notes for local and demo observability.
 * No Datadog, no profile fields, no voice transcripts.
 */

export type OpsKind =
  | "api"
  | "ai"
  | "voice"
  | "decision"
  | "session"
  | "ai_validation";

export type OpsEvent = {
  kind: OpsKind;
  name: string;
  ok: boolean;
  ms: number;
  code?: string;
  at: string;
};

const MAX_EVENTS = 200;
const events: OpsEvent[] = [];

export function recordOpsEvent(input: Omit<OpsEvent, "at">): OpsEvent {
  const entry: OpsEvent = { ...input, at: new Date().toISOString() };
  events.push(entry);
  if (events.length > MAX_EVENTS) {
    events.shift();
  }
  return entry;
}

export async function timeOps<T>(
  kind: OpsKind,
  name: string,
  run: () => Promise<T>,
  codeFromError?: (error: unknown) => string | undefined,
): Promise<T> {
  const started = Date.now();
  try {
    const value = await run();
    recordOpsEvent({ kind, name, ok: true, ms: Date.now() - started });
    return value;
  } catch (error) {
    const code = codeFromError?.(error);
    recordOpsEvent({
      kind,
      name,
      ok: false,
      ms: Date.now() - started,
      ...(code === undefined ? {} : { code }),
    });
    throw error;
  }
}

export function timeOpsSync<T>(kind: OpsKind, name: string, run: () => T): T {
  const started = Date.now();
  try {
    const value = run();
    recordOpsEvent({ kind, name, ok: true, ms: Date.now() - started });
    return value;
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error && typeof error.code === "string"
        ? error.code
        : undefined;
    recordOpsEvent({
      kind,
      name,
      ok: false,
      ms: Date.now() - started,
      ...(code === undefined ? {} : { code }),
    });
    throw error;
  }
}

export type OpsBucketSummary = {
  count: number;
  ok: number;
  errors: number;
  avgMs: number;
  maxMs: number;
  codes: Record<string, number>;
};

export type OpsSummary = {
  windowSize: number;
  byKind: Partial<Record<OpsKind, OpsBucketSummary>>;
  recent: OpsEvent[];
};

function summarize(rows: OpsEvent[]): OpsBucketSummary {
  const codes: Record<string, number> = {};
  let ok = 0;
  let totalMs = 0;
  let maxMs = 0;
  for (const row of rows) {
    if (row.ok) {
      ok += 1;
    } else if (row.code) {
      codes[row.code] = (codes[row.code] ?? 0) + 1;
    } else {
      codes["UNKNOWN"] = (codes["UNKNOWN"] ?? 0) + 1;
    }
    totalMs += row.ms;
    if (row.ms > maxMs) {
      maxMs = row.ms;
    }
  }
  return {
    count: rows.length,
    ok,
    errors: rows.length - ok,
    avgMs: rows.length === 0 ? 0 : Math.round(totalMs / rows.length),
    maxMs,
    codes,
  };
}

export function opsSummary(limit = 40): OpsSummary {
  const recent = events.slice(-Math.max(1, Math.min(limit, MAX_EVENTS)));
  const byKind: OpsSummary["byKind"] = {};
  for (const kind of [
    "api",
    "ai",
    "voice",
    "decision",
    "session",
    "ai_validation",
  ] as const) {
    const rows = events.filter((item) => item.kind === kind);
    if (rows.length > 0) {
      byKind[kind] = summarize(rows);
    }
  }
  return { windowSize: events.length, byKind, recent };
}

/** Test helper */
export function clearOpsEvents(): void {
  events.length = 0;
}

export function recentOpsEvents(): readonly OpsEvent[] {
  return events;
}
