import { Router } from "express";
import { opportunityTypeSchema } from "@hulum/shared";
import { fail, ok } from "../lib/http.js";
import { filterOpportunities } from "../opportunities/search.js";
import { loadStore } from "../store/fileStore.js";

export const opportunitiesRouter = Router();

opportunitiesRouter.get("/", async (req, res) => {
  const store = await loadStore();
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const parsedType = type ? opportunityTypeSchema.safeParse(type) : null;
  const items = filterOpportunities(store.opportunities, {
    type: parsedType?.success ? parsedType.data : undefined,
    q,
  });
  ok(res, items);
});

opportunitiesRouter.get("/:id", async (req, res) => {
  const store = await loadStore();
  const opportunity = store.opportunities.find((item) => item.id === req.params.id);
  if (!opportunity) {
    fail(res, "Opportunity not found.", 404, "OPPORTUNITY_NOT_FOUND");
    return;
  }
  ok(res, opportunity);
});
