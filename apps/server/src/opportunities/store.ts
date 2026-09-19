import type { Opportunity } from "@hulum/shared";
import { getPool } from "../db/pool.js";
import { mapOpportunityRow, type OpportunityRow } from "./mapper.js";

export type OpportunityStore = {
  list(): Promise<Opportunity[]>;
  getById(id: string): Promise<Opportunity | undefined>;
};

const SELECT_COLUMNS = `
  id, title, organization, type, description, deadline,
  country_eligibility, education_requirements, field_requirements,
  experience_requirements, language_requirements, document_requirements,
  other_requirements, application_url, source_url, verification_status,
  last_verified_at, created_at, updated_at
`;

export function createPgOpportunityStore(): OpportunityStore {
  return {
    async list(): Promise<Opportunity[]> {
      const result = await getPool().query<OpportunityRow>(
        `select ${SELECT_COLUMNS} from opportunities order by deadline asc`,
      );
      return result.rows.map(mapOpportunityRow);
    },

    async getById(id: string): Promise<Opportunity | undefined> {
      const result = await getPool().query<OpportunityRow>(
        `select ${SELECT_COLUMNS} from opportunities where id = $1`,
        [id],
      );
      const row = result.rows[0];
      if (row === undefined) {
        return undefined;
      }
      return mapOpportunityRow(row);
    },
  };
}
