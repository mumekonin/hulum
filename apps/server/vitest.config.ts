import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: [
      "src/decision/engine.test.ts",
      "src/opportunities/search.test.ts",
      "src/shared-failure-messages.test.ts",
      "src/http/error-handler.node.test.ts",
    ],
  },
});
