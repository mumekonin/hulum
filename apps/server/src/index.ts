import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { loadStore } from "./store/fileStore.js";

const env = loadEnv();

try {
  await loadStore();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`HULUM API listening on port ${env.PORT}`);
  });
} catch (error) {
  const message = error instanceof Error ? error.message : "Failed to start server";
  console.error(message);
  process.exit(1);
}
