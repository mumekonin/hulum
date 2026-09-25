import { seedCatalog } from "./seed-catalog.js";

seedCatalog()
  .then(() => {
    console.log("Catalog seed is closed. Opportunities come from the investigator, not db:seed.");
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Seed command failed";
    console.error(message);
    process.exit(1);
  });
