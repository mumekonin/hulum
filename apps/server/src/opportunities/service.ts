import type { Opportunity } from "@hulum/shared";
import type { OpportunityStore } from "./store.js";

export type OpportunityService = {
  list(): Promise<Opportunity[]>;
  getById(id: string): Promise<Opportunity | undefined>;
};

export function createOpportunityService(store: OpportunityStore): OpportunityService {
  return {
    list(): Promise<Opportunity[]> {
      return store.list();
    },
    getById(id: string): Promise<Opportunity | undefined> {
      return store.getById(id);
    },
  };
}
