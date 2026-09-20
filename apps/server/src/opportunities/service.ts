import type { Opportunity } from "@hulum/shared";
import type { Clock } from "../services/common/clock.js";
import { systemClock } from "../services/common/clock.js";
import { presentOpportunity } from "../verification/index.js";
import type { OpportunityStore } from "./store.js";

export type OpportunityService = {
  list(): Promise<Opportunity[]>;
  getById(id: string): Promise<Opportunity | undefined>;
};

export function createOpportunityService(
  store: OpportunityStore,
  clock: Clock = systemClock,
): OpportunityService {
  return {
    async list(): Promise<Opportunity[]> {
      const rows = await store.list();
      return rows.map((row) => presentOpportunity(row, clock));
    },
    async getById(id: string): Promise<Opportunity | undefined> {
      const row = await store.getById(id);
      if (row === undefined) {
        return undefined;
      }
      return presentOpportunity(row, clock);
    },
  };
}
