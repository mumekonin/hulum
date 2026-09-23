import { seedOpportunities } from "../data/seedOpportunities.js";
import { getPool } from "./pool.js";

function asList(value: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter((item) => item !== "");
  }
  const trimmed = value.trim();
  return trimmed === "" ? [] : [trimmed];
}

export async function seedCatalog(): Promise<{ inserted: number; skipped: number }> {
  const pool = getPool();
  let inserted = 0;
  let skipped = 0;

  for (const item of seedOpportunities) {
    const existing = await pool.query(
      "select 1 from opportunities where lower(title) = lower($1) and source_url = $2 limit 1",
      [item.title, item.sourceUrl],
    );
    if ((existing.rowCount ?? 0) > 0) {
      skipped += 1;
      continue;
    }

    await pool.query(
      `insert into opportunities (
         title, organization, type, description, deadline,
         country_eligibility, education_requirements, field_requirements,
         experience_requirements, language_requirements, document_requirements,
         other_requirements, application_url, source_url, verification_status, last_verified_at
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        item.title,
        item.organization,
        item.type,
        item.description,
        item.deadline,
        item.countryEligibility,
        asList(item.educationRequirements),
        asList(item.fieldRequirements),
        asList(item.experienceRequirements),
        asList(item.languageRequirements),
        item.documentRequirements,
        item.otherRequirements,
        item.applicationUrl,
        item.sourceUrl,
        item.verificationStatus,
        item.lastVerifiedAt,
      ],
    );
    inserted += 1;
  }

  return { inserted, skipped };
}
