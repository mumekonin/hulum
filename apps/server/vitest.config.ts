import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["src/decision/engine.test.ts", "src/opportunities/search.test.ts"],
  },
});
