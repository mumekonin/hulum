import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";

const env = loadEnv();

try {
  const app = createApp({ store: "postgres", env });
  app.listen(env.PORT, () => {
    console.log(`HULUM API listening on port ${env.PORT}`);
    console.log(`ScholarXIV key: ${env.SCHOLARXIV_API_KEY ? "set" : "missing"}`);
  });
} catch (error) {
  const message = error instanceof Error ? error.message : "Failed to start server";
  console.error(message);
  process.exit(1);
}
