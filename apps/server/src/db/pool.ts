import pg from "pg";
import { requireDatabaseUrl } from "./client.js";

let pool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  if (pool === undefined) {
    pool = new pg.Pool({ connectionString: requireDatabaseUrl() });
  }
  return pool;
}
