import { applyMigrations } from "./migrate.js";
import { smokePersistRetrieve } from "./smoke.js";

async function run(): Promise<void> {
  await applyMigrations();
  await smokePersistRetrieve();
  console.log("Database smoke: persist and retrieve succeeded (transaction rolled back).");
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Database smoke failed";
  console.error(message);
  process.exit(1);
});
