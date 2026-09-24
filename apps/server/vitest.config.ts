import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "src/decision/engine.test.ts",
      "src/opportunities/search.test.ts",
      "**/shared-failure-messages.test.ts",
      "**/error-handler.node.test.ts",
      "**/*.node.test.ts",
    ],
  },
});
