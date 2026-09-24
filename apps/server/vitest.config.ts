import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Vitest suites only — Node built-in runner files use *.node.test.ts
    include: ["src/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.node.test.ts",
    ],
  },
});
