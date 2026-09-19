import express from "express";
import { errorHandler, notFoundHandler } from "./http/error-handler.js";
import { createApiRouter } from "./routes/index.js";

export function createApp(): express.Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", createApiRouter());
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
