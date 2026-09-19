import fs from "node:fs/promises";
import path from "node:path";
import { createPgClient } from "./client.js";
import { migrationsDir } from "./paths.js";

export async function applyMigrations(): Promise<string[]> {
  const client = createPgClient();
  const applied: string[] = [];

  await client.connect();
  try {
    await client.query(`
      create table if not exists schema_migrations (
        id text primary key,
        applied_at timestamptz not null default now()
      )
    `);

    const files = (await fs.readdir(migrationsDir()))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const already = await client.query<{ id: string }>(
        "select id from schema_migrations where id = $1",
        [file],
      );
      if ((already.rowCount ?? 0) > 0) {
        continue;
      }

      const sql = await fs.readFile(path.join(migrationsDir(), file), "utf8");
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into schema_migrations (id) values ($1)", [file]);
        await client.query("commit");
        applied.push(file);
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }

    return applied;
  } finally {
    await client.end();
  }
}
