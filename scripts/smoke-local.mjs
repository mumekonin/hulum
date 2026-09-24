#!/usr/bin/env node
/**
 * Local API smoke (not a browser pass, not production).
 * Covers the demo triangle: Abeba → A2SV APPLY, UCT MAYBE, Chevening SKIP.
 * Requires: API on :3001, migrated + seeded Postgres.
 *
 *   npm run db:migrate && npm run db:seed
 *   npm run dev:server   # other terminal
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

async function analyzeExpect(userId, opportunity, expected) {
  const analysis = await json(`/api/opportunities/${opportunity.id}/analyze`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
  if (analysis.decision !== expected) {
    throw new Error(
      `expected ${expected} for Abeba+${opportunity.title}, got ${analysis.decision}`,
    );
  }
  console.log(`ok: Abeba → ${opportunity.title} → ${analysis.decision} (fit ${analysis.fitScore})`);
}

function findOpportunity(opportunities, pattern, label) {
  const item = opportunities.find((row) => pattern.test(row.title ?? ""));
  if (!item) throw new Error(`${label} opportunity not found — run npm run db:seed`);
  return item;
}

async function main() {
  console.log(`smoke:local → ${API}`);
  await json("/api/health");
  const demo = await json("/api/profile/demo", { method: "POST" });
  const userId = demo.profile?.userId ?? demo.userId;
  if (!userId) throw new Error("demo profile missing userId");
  const opportunities = await json("/api/opportunities");

  const a2sv = findOpportunity(opportunities, /a2sv/i, "A2SV");
  const uct = findOpportunity(opportunities, /mastercard.*uct|uct.*mastercard/i, "UCT Mastercard");
  const chevening = findOpportunity(opportunities, /chevening/i, "Chevening");

  await analyzeExpect(userId, a2sv, "APPLY");
  await analyzeExpect(userId, uct, "MAYBE");
  await analyzeExpect(userId, chevening, "SKIP");
  console.log("ok: demo triangle APPLY / MAYBE / SKIP");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
