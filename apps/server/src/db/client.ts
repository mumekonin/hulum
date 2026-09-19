import pg from "pg";
import { loadEnv } from "../config/env.js";

export function requireDatabaseUrl(): string {
  const env = loadEnv();
  if (env.DATABASE_URL === undefined) {
    throw new Error("DATABASE_URL is missing. Set it in local .env. Do not commit it.");
  }
  return env.DATABASE_URL;
}

export function createPgClient(): pg.Client {
  return new pg.Client({ connectionString: requireDatabaseUrl() });
}
