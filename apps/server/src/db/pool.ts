import pg from "pg";
import { requireDatabaseUrl } from "./client.js";

let pool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  if (pool === undefined) {
    pool = new pg.Pool({
      connectionString: requireDatabaseUrl(),
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
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
