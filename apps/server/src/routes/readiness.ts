import { Router } from "express";
import { readinessPatchSchema } from "@hulum/shared";
import { fail, ok } from "../lib/http.js";
import { nowIso } from "../lib/id.js";
import { mutateStore } from "../store/fileStore.js";

export const readinessRouter = Router();

readinessRouter.patch("/:id", async (req, res) => {
  const parsed = readinessPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, "Invalid readiness status.", 422, "INVALID_READINESS");
    return;
  }

  const item = await mutateStore((store) => {
    const existing = store.readinessItems.find((row) => row.id === req.params.id);
    if (!existing) return null;
    existing.status = parsed.data.status;
    existing.updatedAt = nowIso();
    return existing;
  });

  if (!item) {
    fail(res, "Readiness item not found.", 404, "READINESS_NOT_FOUND");
    return;
  }
  ok(res, item);
});
