import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { applyMigrations } from "./db/migrate.js";
import { startInvestigateWorker } from "./investigator/worker.js";

async function main(): Promise<void> {
  const env = loadEnv();
  if (env.NODE_ENV === "production") {
    const applied = await applyMigrations();
    console.log(
      applied.length === 0 ? "No new database migrations." : `Applied migrations: ${applied.join(", ")}`,
    );
  }

  const app = createApp({ store: "postgres", env });
  const worker = startInvestigateWorker(env);
  const server = app.listen(env.PORT, "0.0.0.0", () => {
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
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Failed to start server";
  console.error(message);
  process.exit(1);
});
