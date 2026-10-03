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

describe("013_ethioscholarship_catalog.sql", () => {
  const sql = fs.readFileSync(path.join(migrationsDir(), "013_ethioscholarship_catalog.sql"), "utf8");

  it("points EthioScholarship at the scholarships catalog", () => {
    expect(sql).toContain("https://scholarship.et/scholarships");
    expect(sql).toContain("EthioScholarship");
  });
});

describe("012_afriwork_jobs_source.sql", () => {
  const sql = fs.readFileSync(path.join(migrationsDir(), "012_afriwork_jobs_source.sql"), "utf8");

  it("adds Afriwork jobs as a lead source", () => {
    expect(sql).toContain("https://afriworket.com/jobs");
    expect(sql).toContain("is_lead");
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

describe("014_hulum_app_role.sql", () => {
  const sql = fs.readFileSync(path.join(migrationsDir(), "014_hulum_app_role.sql"), "utf8");

  it("creates hulum_app and owner policy for profile_documents", () => {
    expect(sql).toContain("create role hulum_app");
    expect(sql).toContain("grant hulum_app to");
    expect(sql).toContain("profile_documents_owner_all");
    expect(sql).toContain("app_current_user_id()");
  });
});

describe("015_ci_smoke_investigator_row.sql", () => {
  const sql = fs.readFileSync(path.join(migrationsDir(), "015_ci_smoke_investigator_row.sql"), "utf8");

  it("inserts one AI_EXTRACTED CI smoke row without reopening curated seed", () => {
    expect(sql).toContain("AI_EXTRACTED");
    expect(sql).toContain("CI / local smoke only");
    expect(sql).toContain("00000000-0000-4000-8000-000000000015");
    expect(sql).toMatch(/'AI_EXTRACTED'/);
    expect(sql).not.toMatch(/verification_status[\s\S]*'VERIFIED'|,\s*'VERIFIED'\s*,/);
    expect(sql).toContain("on conflict (id) do nothing");
  });
});

describe("011_saved_opportunities.sql", () => {
  const sql = fs.readFileSync(path.join(migrationsDir(), "011_saved_opportunities.sql"), "utf8");

  it("keys saves per user and opportunity with an owner policy", () => {
    expect(sql).toContain("create table if not exists saved_opportunities");
    expect(sql).toContain("primary key (user_id, opportunity_id)");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("user_id = app_current_user_id()");
  });

  it("does not store a decision", () => {
    expect(sql).not.toMatch(/\bdecision\s+text/);
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
