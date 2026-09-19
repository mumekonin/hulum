import { createPgClient } from "./client.js";

type IdRow = {
  id: string;
};

export async function smokePersistRetrieve(): Promise<void> {
  const client = createPgClient();
  await client.connect();

  try {
    await client.query("begin");

    const user = await client.query<IdRow>(
      "insert into users (name, email) values ($1, $2) returning id",
      ["HULUM Schema Smoke", "hulum-schema-smoke@example.invalid"],
    );
    const userId = user.rows[0]?.id;
    if (userId === undefined) {
      throw new Error("Failed to persist user");
    }

    const profile = await client.query<IdRow>(
      `insert into profiles (user_id, education_level, field_of_study, country)
       values ($1, $2, $3, $4)
       returning id`,
      [userId, "university_student", "computer_science", "ET"],
    );
    if (profile.rows[0]?.id === undefined) {
      throw new Error("Failed to persist profile");
    }

    const opportunity = await client.query<IdRow>(
      `insert into opportunities (
         title, organization, type, description, deadline, source_url, verification_status
       ) values ($1, $2, $3, $4, $5, $6, $7)
       returning id`,
      [
        "HULUM schema smoke (rolled back)",
        "HULUM",
        "scholarship",
        "Temporary row used only to verify insert and select.",
        "2026-12-31",
        "https://example.invalid/hulum-schema-smoke",
        "NEEDS_REVIEW",
      ],
    );
    const opportunityId = opportunity.rows[0]?.id;
    if (opportunityId === undefined) {
      throw new Error("Failed to persist opportunity");
    }

    const analysis = await client.query<IdRow>(
      `insert into analyses (user_id, opportunity_id, decision, fit_score, summary)
       values ($1, $2, $3, $4, $5)
       returning id`,
      [userId, opportunityId, "MAYBE", 68, "Smoke analysis"],
    );
    const analysisId = analysis.rows[0]?.id;
    if (analysisId === undefined) {
      throw new Error("Failed to persist analysis");
    }

    const requirement = await client.query<IdRow>(
      `insert into requirement_results (
         analysis_id, requirement_key, requirement_text, status, evidence
       ) values ($1, $2, $3, $4, $5)
       returning id`,
      [analysisId, "education", "University student", "MET", "Profile lists university student"],
    );
    if (requirement.rows[0]?.id === undefined) {
      throw new Error("Failed to persist requirement result");
    }

    const readiness = await client.query<IdRow>(
      `insert into readiness_items (analysis_id, title, status, priority)
       values ($1, $2, $3, $4)
       returning id`,
      [analysisId, "Verify official source", "TODO", 1],
    );
    if (readiness.rows[0]?.id === undefined) {
      throw new Error("Failed to persist readiness item");
    }

    const voice = await client.query<IdRow>(
      `insert into voice_sessions (user_id, language) values ($1, $2) returning id`,
      [userId, "en"],
    );
    if (voice.rows[0]?.id === undefined) {
      throw new Error("Failed to persist voice session");
    }

    const readBack = await client.query<{ decision: string; status: string }>(
      `select a.decision, r.status
       from analyses a
       join requirement_results r on r.analysis_id = a.id
       where a.id = $1`,
      [analysisId],
    );
    if (readBack.rows[0]?.decision !== "MAYBE" || readBack.rows[0]?.status !== "MET") {
      throw new Error("Failed to retrieve persisted analysis rows");
    }

    await client.query("rollback");
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}
