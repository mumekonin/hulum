#!/usr/bin/env node
/**
 * Local API smoke (not a browser pass, not production).
 * Catalog seed is closed — does not require A2SV / UCT / Chevening cards.
 *
 *   npm run db:migrate
 *   npm run dev:server
 *   npm run smoke:local
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:3001";

async function json(path, init) {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await response.json();
  if (!response.ok || body.error || body.data == null) {
    throw new Error(`${path} → ${response.status} ${JSON.stringify(body.error ?? body)}`);
  }
  return body.data;
}

async function main() {
  console.log(`smoke:local → ${API}`);
  await json("/api/health");
  const demo = await json("/api/profile/demo", { method: "POST" });
  const userId = demo.profile?.userId ?? demo.userId;
  if (!userId) throw new Error("demo profile missing userId");
  const opportunities = await json("/api/opportunities");
  if (!Array.isArray(opportunities)) {
    throw new Error("opportunities list is not an array");
  }
  console.log(`ok: health, demo profile ${userId}, catalog ${String(opportunities.length)} (investigator, not seed)`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
