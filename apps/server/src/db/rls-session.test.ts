import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";
import { afterAll, describe, expect, it } from "vitest";
import { closePool, getPool } from "./pool.js";
import { dbQuery, withUserRls } from "./rls-session.js";

loadDotenv({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env"),
});

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDatabaseUrl)("hulum_app RLS isolation", () => {
  afterAll(async () => {
    await closePool();
  }, 30_000);

  it("lets user A read own profile and not user B under SET ROLE hulum_app", { timeout: 90_000 }, async () => {
    const pool = getPool();
    const role = await pool.query<{ exists: boolean }>(
      `select exists(select 1 from pg_roles where rolname = 'hulum_app') as exists`,
    );
    if (role.rows[0]?.exists !== true) {
      throw new Error("Run npm run db:migrate so migration 014 creates hulum_app.");
    }

    const userA = (
      await pool.query<{ id: string }>(
        `insert into users (name, email) values ('RLS A', $1) returning id`,
        [`rls-a-${Date.now()}@example.com`],
      )
    ).rows[0];
    const userB = (
      await pool.query<{ id: string }>(
        `insert into users (name, email) values ('RLS B', $1) returning id`,
        [`rls-b-${Date.now()}@example.com`],
      )
    ).rows[0];
    if (userA === undefined || userB === undefined) {
      throw new Error("Failed to insert RLS test users");
    }

    await pool.query(
      `insert into profiles (user_id, education_level, country, languages, skills, interests)
       values ($1, null, null, '{}', '{}', '{}'), ($2, null, null, '{}', '{}', '{}')`,
      [userA.id, userB.id],
    );

    try {
      const own = await withUserRls(userA.id, async () => {
        return dbQuery<{ user_id: string }>(`select user_id from profiles where user_id = $1`, [userA.id]);
      });
      expect(own.rows).toHaveLength(1);

      const other = await withUserRls(userA.id, async () => {
        return dbQuery<{ user_id: string }>(`select user_id from profiles where user_id = $1`, [userB.id]);
      });
      expect(other.rows).toHaveLength(0);

      const leaked = await withUserRls(userA.id, async () => {
        return dbQuery<{ user_id: string }>(`select user_id from profiles`);
      });
      expect(leaked.rows.every((row) => row.user_id === userA.id)).toBe(true);
    } finally {
      await pool.query(`delete from users where id = any($1::uuid[])`, [[userA.id, userB.id]]);
    }
  });
});
