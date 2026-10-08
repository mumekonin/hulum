import type { AnalysisSummary, Decision, OpportunityType, SavedOpportunity } from "@hulum/shared";
import { dbQuery } from "../db/rls-session.js";
import { HttpError } from "../http/errors.js";

export type HistoryStore = {
  /** Latest analysis per opportunity for this user, newest first. */
  listLatestAnalyses(userId: string, opportunityId?: string): Promise<AnalysisSummary[]>;
  listSaved(userId: string): Promise<SavedOpportunity[]>;
  save(userId: string, opportunityId: string): Promise<SavedOpportunity>;
  /** Returns false when nothing was saved for this pair. */
  unsave(userId: string, opportunityId: string): Promise<boolean>;
};

type SummaryRow = {
  analysis_id: string;
  opportunity_id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  deadline: string;
  decision: Decision;
  fit_score: number;
  created_at: Date;
  readiness_done: string;
  readiness_total: string;
};

type SavedRow = { opportunity_id: string; created_at: Date };

function isForeignKeyViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23503";
}

function toSaved(row: SavedRow): SavedOpportunity {
  return { opportunityId: row.opportunity_id, savedAt: row.created_at.toISOString() };
}

export function createPgHistoryStore(): HistoryStore {
  return {
    async listLatestAnalyses(userId, opportunityId) {
      const result = await dbQuery<SummaryRow>(
        `select * from (
           select distinct on (a.opportunity_id)
             a.id as analysis_id,
             a.opportunity_id,
             o.title,
             o.organization,
             o.type,
             to_char(o.deadline, 'YYYY-MM-DD') as deadline,
             a.decision,
             a.fit_score,
             a.created_at,
             (select count(*) from readiness_items r
               where r.analysis_id = a.id and r.status = 'DONE') as readiness_done,
             (select count(*) from readiness_items r
               where r.analysis_id = a.id and r.status <> 'NOT_REQUIRED') as readiness_total
           from analyses a
           join opportunities o on o.id = a.opportunity_id
           where a.user_id = $1 and ($2::uuid is null or a.opportunity_id = $2::uuid)
           order by a.opportunity_id, a.created_at desc
         ) latest
         order by created_at desc`,
        [userId, opportunityId ?? null],
      );
      return result.rows.map((row) => ({
        analysisId: row.analysis_id,
        opportunityId: row.opportunity_id,
        title: row.title,
        organization: row.organization,
        type: row.type,
        deadline: row.deadline,
        decision: row.decision,
        fitScore: row.fit_score,
        analyzedAt: row.created_at.toISOString(),
        readiness: { done: Number(row.readiness_done), total: Number(row.readiness_total) },
      }));
    },

    async listSaved(userId) {
      const result = await dbQuery<SavedRow>(
        `select opportunity_id, created_at from saved_opportunities
         where user_id = $1 order by created_at desc`,
        [userId],
      );
      return result.rows.map(toSaved);
    },

    async save(userId, opportunityId) {
      try {
        const result = await dbQuery<SavedRow>(
          `insert into saved_opportunities (user_id, opportunity_id) values ($1, $2)
           on conflict (user_id, opportunity_id) do update set user_id = excluded.user_id
           returning opportunity_id, created_at`,
          [userId, opportunityId],
        );
        const row = result.rows[0];
        if (row === undefined) {
          throw new Error("Saved opportunity insert returned no row");
        }
        return toSaved(row);
      } catch (error) {
        if (isForeignKeyViolation(error)) {
          throw new HttpError(404, "NOT_FOUND", "Opportunity not found.");
        }
        throw error;
      }
    },

    async unsave(userId, opportunityId) {
      const result = await dbQuery(
        `delete from saved_opportunities where user_id = $1 and opportunity_id = $2`,
        [userId, opportunityId],
      );
      return (result.rowCount ?? 0) > 0;
    },
  };
}
