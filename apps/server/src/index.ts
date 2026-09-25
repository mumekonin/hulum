import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { startInvestigateWorker } from "./investigator/worker.js";

const env = loadEnv();

try {
  const app = createApp({ store: "postgres", env });
  const worker = startInvestigateWorker(env);
  const server = app.listen(env.PORT, () => {
    console.log(`HULUM API listening on port ${env.PORT}`);
    console.log(`ScholarXIV key: ${env.SCHOLARXIV_API_KEY ? "set" : "missing"}`);
    console.log(`Google OAuth: ${env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? "set" : "missing"}`);
  });
  const shutdown = () => {
    worker.stop();
    server.close();
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
} catch (error) {
  const message = error instanceof Error ? error.message : "Failed to start server";
  console.error(message);
  process.exit(1);
}
