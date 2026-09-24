#!/usr/bin/env node
/**
 * Local API smoke (not a browser pass, not production).
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

async function main() {
  console.log(`smoke:local → ${API}`);
  await json("/api/health");
  const demo = await json("/api/profile/demo", { method: "POST" });
  const userId = demo.profile?.userId ?? demo.userId;
  if (!userId) throw new Error("demo profile missing userId");
  const opportunities = await json("/api/opportunities");
  const a2sv = opportunities.find((item) => /a2sv/i.test(item.title ?? ""));
  if (!a2sv) throw new Error("A2SV opportunity not found — run npm run db:seed");
  const analysis = await json(`/api/opportunities/${a2sv.id}/analyze`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
  if (analysis.decision !== "APPLY") {
    throw new Error(`expected APPLY for Abeba+A2SV, got ${analysis.decision}`);
  }
  console.log(`ok: Abeba → ${a2sv.title} → ${analysis.decision} (fit ${analysis.fitScore})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
