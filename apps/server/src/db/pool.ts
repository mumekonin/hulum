import pg from "pg";
import { requireDatabaseUrl } from "./client.js";

let pool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  if (pool === undefined) {
    pool = new pg.Pool({ connectionString: requireDatabaseUrl() });
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
