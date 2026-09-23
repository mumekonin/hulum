import { closePool } from "./pool.js";
import { seedCatalog } from "./seed-catalog.js";

seedCatalog()
  .then((result) => {
    console.log(`Catalog seed inserted ${String(result.inserted)}, skipped ${String(result.skipped)}.`);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Catalog seed failed";
    console.error(message);
    process.exitCode = 1;
  })
  .finally(() => closePool());
