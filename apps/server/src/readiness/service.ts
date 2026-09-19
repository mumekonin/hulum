import type { ReadinessItem, ReadinessStatus } from "@hulum/shared";
import { HttpError } from "../http/errors.js";
import type { ReadinessStore } from "./store.js";

export type ReadinessService = {
  updateStatus(id: string, status: ReadinessStatus): Promise<ReadinessItem>;
};

export function createReadinessService(store: ReadinessStore): ReadinessService {
  return {
    async updateStatus(id: string, status: ReadinessStatus): Promise<ReadinessItem> {
      const updated = await store.updateStatus(id, status);
      if (updated === undefined) {
        throw new HttpError(404, "NOT_FOUND", "Readiness item not found.");
      }
      return updated;
    },
  };
}
