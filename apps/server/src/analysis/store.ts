import type { Analysis, RequirementMatch } from "@hulum/shared";
import { getPool } from "../db/pool.js";
import {
  mapAnalysis,
  mapReadinessRow,
  mapRequirementRow,
  type AnalysisRow,
  type ReadinessRow,
  type RequirementRow,
} from "./mapper.js";

export type PersistAnalysisInput = {
  userId: string;
  opportunityId: string;
  decision: Analysis["decision"];
  fitScore: number;
  summary: string;
  matches: RequirementMatch[];
};

export type AnalysisStore = {
  create(input: PersistAnalysisInput): Promise<Analysis>;
  getById(id: string): Promise<Analysis | undefined>;
};

const ANALYSIS_COLUMNS = `
  id, user_id, opportunity_id, decision, fit_score, summary, created_at, updated_at
`;

const REQUIREMENT_COLUMNS = `
  id, analysis_id, requirement_key, requirement_text, status, evidence, reason
`;

const READINESS_COLUMNS = `
  id, analysis_id, title, description, status, priority, created_at, updated_at
`;

async function loadChildren(
  analysisId: string,
): Promise<{ requirements: RequirementRow[]; readiness: ReadinessRow[] }> {
  const pool = getPool();
  const [requirements, readiness] = await Promise.all([
    pool.query<RequirementRow>(
      `select ${REQUIREMENT_COLUMNS} from requirement_results where analysis_id = $1 order by id`,
      [analysisId],
    ),
    pool.query<ReadinessRow>(
      `select ${READINESS_COLUMNS} from readiness_items where analysis_id = $1 order by priority, id`,
      [analysisId],
    ),
  ]);
  return { requirements: requirements.rows, readiness: readiness.rows };
}

export function createPgAnalysisStore(): AnalysisStore {
  return {
    async create(input: PersistAnalysisInput): Promise<Analysis> {
      const client = await getPool().connect();
      try {
        await client.query("begin");
        const analysis = await client.query<AnalysisRow>(
          `insert into analyses (user_id, opportunity_id, decision, fit_score, summary)
           values ($1, $2, $3, $4, $5)
           returning ${ANALYSIS_COLUMNS}`,
          [input.userId, input.opportunityId, input.decision, input.fitScore, input.summary],
        );
        const analysisRow = analysis.rows[0];
        if (analysisRow === undefined) {
          throw new Error("Failed to persist analysis");
        }

        const requirementRows: RequirementRow[] = [];
        for (const match of input.matches) {
          const inserted = await client.query<RequirementRow>(
            `insert into requirement_results (
               analysis_id, requirement_key, requirement_text, status, evidence, reason
             ) values ($1, $2, $3, $4, $5, $6)
             returning ${REQUIREMENT_COLUMNS}`,
            [analysisRow.id, match.key, match.text, match.status, match.evidence, match.reason],
          );
          const row = inserted.rows[0];
          if (row === undefined) {
            throw new Error("Failed to persist requirement result");
          }
          requirementRows.push(row);
        }

        await client.query("commit");
        return mapAnalysis(analysisRow, requirementRows.map(mapRequirementRow), []);
      } catch (error) {
        await client.query("rollback");
        throw error;
      } finally {
        client.release();
      }
    },

    async getById(id: string): Promise<Analysis | undefined> {
      const result = await getPool().query<AnalysisRow>(
        `select ${ANALYSIS_COLUMNS} from analyses where id = $1`,
        [id],
      );
      const row = result.rows[0];
      if (row === undefined) {
        return undefined;
      }
      const children = await loadChildren(id);
      return mapAnalysis(
        row,
        children.requirements.map(mapRequirementRow),
        children.readiness.map(mapReadinessRow),
      );
    },
  };
}
