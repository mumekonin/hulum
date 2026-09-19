import { loadEnv } from "./config/env.js";
import { createApp } from "./app.js";

function start(): void {
  const env = loadEnv();
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`hulum-server listening on port ${env.PORT}`);
  });
}

try {
  start();
} catch (error) {
  const message = error instanceof Error ? error.message : "Failed to start server";
  console.error(message);
  process.exit(1);
}
