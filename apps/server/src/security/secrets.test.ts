import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const serverRoot = resolve(here, "../..");
const repoRoot = resolve(serverRoot, "../..");

function exampleValues(contents: string): Array<{ key: string; value: string }> {
  return contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      if (separator === -1) {
        return { key: line, value: "" };
      }
      return { key: line.slice(0, separator), value: line.slice(separator + 1) };
    });
}

describe("committed env templates", () => {
  it("ignores .env files in git", () => {
    const gitignore = readFileSync(resolve(repoRoot, ".gitignore"), "utf8");
    expect(gitignore.includes(".env")).toBe(true);
    expect(gitignore.includes("!.env.example")).toBe(true);
  });

  it("keeps .env.example free of secret values", () => {
    const files = [
      readFileSync(resolve(serverRoot, ".env.example"), "utf8"),
      readFileSync(resolve(repoRoot, ".env.example"), "utf8"),
    ];
    for (const contents of files) {
      expect(contents.includes("gsk_")).toBe(false);
      expect(contents.includes("postgres://")).toBe(false);
      for (const row of exampleValues(contents)) {
        if (row.key === "GROQ_MODEL") {
          expect(row.value.length).toBeGreaterThan(0);
          continue;
        }
        expect(row.value).toBe("");
      }
    }
  });
});
