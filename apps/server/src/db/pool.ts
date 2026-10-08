import pg from "pg";
import { requireDatabaseUrl } from "./client.js";

let pool: pg.Pool | undefined;

/** Remote Postgres (e.g. Neon cold start) often needs more than 5s on the first connect. */
const DEFAULT_CONNECT_TIMEOUT_MS = 15_000;

export function connectTimeoutMs(raw = process.env.DATABASE_CONNECT_TIMEOUT_MS): number {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : DEFAULT_CONNECT_TIMEOUT_MS;
}

export function getPool(): pg.Pool {
  if (pool === undefined) {
    pool = new pg.Pool({
      connectionString: requireDatabaseUrl(),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: connectTimeoutMs(),
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool === undefined) {
    return;
  }
  const current = pool;
  pool = undefined;
  await current.end();
}
