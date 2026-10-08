import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Postgres-backed suites may run against a remote dev database; unit suites never connect.
    env: { DATABASE_CONNECT_TIMEOUT_MS: "30000" },
    // Vitest suites only — Node built-in runner files use *.node.test.ts
    include: ["src/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.node.test.ts",
    ],
  },
});
