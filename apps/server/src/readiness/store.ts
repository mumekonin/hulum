import { isReadinessStatus, type ReadinessItem } from "@hulum/shared";
import { dbQuery } from "../db/rls-session.js";
import { mapReadinessRow, type ReadinessRow } from "../analysis/mapper.js";

const READINESS_COLUMNS = `
  id, analysis_id, title, description, status, priority, created_at, updated_at
`;

export type ReadinessStore = {
  getById(id: string): Promise<ReadinessItem | undefined>;
  updateStatus(id: string, status: ReadinessItem["status"]): Promise<ReadinessItem | undefined>;
};

export function createPgReadinessStore(): ReadinessStore {
  return {
    async getById(id: string): Promise<ReadinessItem | undefined> {
      const result = await dbQuery<ReadinessRow>(
        `select ${READINESS_COLUMNS} from readiness_items where id = $1`,
        [id],
      );
      const row = result.rows[0];
      if (row === undefined) {
        return undefined;
      }
      return mapReadinessRow(row);
    },

    async updateStatus(id: string, status: ReadinessItem["status"]): Promise<ReadinessItem | undefined> {
      if (!isReadinessStatus(status)) {
        return undefined;
      }
      const result = await dbQuery<ReadinessRow>(
        `update readiness_items set status = $1 where id = $2
         returning ${READINESS_COLUMNS}`,
        [status, id],
      );
      const row = result.rows[0];
      if (row === undefined) {
        return undefined;
      }
      return mapReadinessRow(row);
    },
  };
}
