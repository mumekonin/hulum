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

describe("003_analysis_decision_audit.sql", () => {
  const sql = fs.readFileSync(path.join(migrationsDir(), "003_analysis_decision_audit.sql"), "utf8");

  it("adds decision_audit jsonb on analyses", () => {
    expect(sql).toContain("decision_audit jsonb");
    expect(sql).toContain("alter table analyses");
  });
});

describe("005_investigator_worker.sql", () => {
  const sql = fs.readFileSync(path.join(migrationsDir(), "005_investigator_worker.sql"), "utf8");

  it("adds official catalog hosts and does not promote aggregators", () => {
    expect(sql).toContain("a2sv.org");
    expect(sql).toContain("chevening.org");
    expect(sql).not.toContain("scholarship.et");
    expect(sql).not.toContain("scholars4dev.com");
    expect(sql).not.toContain("opportunitydesk.org");
  });
});

describe("006_close_catalog_seed.sql", () => {
  const sql = fs.readFileSync(path.join(migrationsDir(), "006_close_catalog_seed.sql"), "utf8");

  it("removes curated seed rows and does not insert replacements", () => {
    expect(sql).toContain("delete from opportunities");
    expect(sql).toContain("https://a2sv.org/");
    expect(sql).not.toContain("insert into opportunities");
  });
});

describe("009_profile_documents.sql", () => {
  const sql = fs.readFileSync(path.join(migrationsDir(), "009_profile_documents.sql"), "utf8");

  it("stores labeled document photos for a user", () => {
    expect(sql).toContain("create table if not exists profile_documents");
    expect(sql).toContain("image/jpeg");
    expect(sql).toContain("application/pdf");
    expect(sql).toContain("bytea");
  });
});

describe("010_profile_document_text.sql", () => {
  const sql = fs.readFileSync(path.join(migrationsDir(), "010_profile_document_text.sql"), "utf8");

  it("caches extracted document text for decide() evidence", () => {
    expect(sql).toContain("extracted_text");
    expect(sql).toContain("extracted_at");
    expect(sql).toContain("extract_status");
    expect(sql).toContain("pending");
    expect(sql).toContain("ready");
    expect(sql).toContain("empty");
    expect(sql).toContain("failed");
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
