import { applyMigrations } from "./migrate.js";

applyMigrations()
  .then((applied) => {
    if (applied.length === 0) {
      console.log("No new database migrations.");
      return;
    }
    console.log(`Applied migrations: ${applied.join(", ")}`);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Migration failed";
    console.error(message);
    process.exit(1);
  });
