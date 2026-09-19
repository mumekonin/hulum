import cors from "cors";
import express from "express";
import { analysisRouter } from "./routes/analysis.js";
import { health } from "./routes/health.js";
import { opportunitiesRouter } from "./routes/opportunities.js";
import { profileRouter } from "./routes/profile.js";
import { readinessRouter } from "./routes/readiness.js";
import { voiceRouter } from "./routes/voice.js";
import { fail, errorHandler } from "./lib/http.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:3000" }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", health);
  app.use("/api/profile", profileRouter);
  app.use("/api/opportunities", opportunitiesRouter);
  app.use("/api", analysisRouter);
  app.use("/api/readiness", readinessRouter);
  app.use("/api/voice", voiceRouter);

  app.use((_req, res) => {
    fail(res, "Route not found.", 404, "NOT_FOUND");
  });
  app.use(errorHandler);

  return app;
}
