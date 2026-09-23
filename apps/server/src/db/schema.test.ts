import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { migrationsDir } from "./paths.js";

describe("002_investigator.sql", () => {
  const sql = fs.readFileSync(path.join(migrationsDir(), "002_investigator.sql"), "utf8");

  it("adds pluggable sources and official domains", () => {
    expect(sql).toContain("create table if not exists sources");
    expect(sql).toContain("create table if not exists official_domains");
    expect(sql).toContain("JOB_OPPORTUNITIES_API_KEY");
    expect(sql).toContain("AI_EXTRACTED");
  });
});

describe("001_init.sql", () => {
  const sql = fs.readFileSync(path.join(migrationsDir(), "001_init.sql"), "utf8");

  it("defines the locked Task 21 tables", () => {
    expect(sql).toContain("create table users");
    expect(sql).toContain("create table profiles");
    expect(sql).toContain("create table opportunities");
    expect(sql).toContain("create table analyses");
    expect(sql).toContain("create table requirement_results");
    expect(sql).toContain("create table readiness_items");
    expect(sql).toContain("create table voice_sessions");
  });

  it("keeps APPLY/MAYBE/SKIP as stored decision values", () => {
    expect(sql).toContain("decision in ('APPLY', 'MAYBE', 'SKIP')");
  });

  it("does not store voice audio or transcripts", () => {
    expect(sql.toLowerCase()).not.toContain("transcript");
    expect(sql.toLowerCase()).not.toContain("audio");
  });
});
