import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { loadStore } from "./store/fileStore.js";

loadEnv();
const port = Number(process.env.PORT ?? 4000);

try {
  await loadStore();
  const app = createApp();
  app.listen(port, () => {
    console.log(`HULUM API listening on http://localhost:${port}`);
  });
} catch (error) {
  const message = error instanceof Error ? error.message : "Failed to start server";
  console.error(message);
  process.exit(1);
}
