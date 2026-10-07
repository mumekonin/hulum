#!/usr/bin/env node
/**
 * Local API smoke (not a browser pass, not production).
 * Catalog seed is closed — does not require A2SV / UCT / Chevening cards.
 * Uses register, not POST /api/profile/demo.
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
  const session = await json("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "CI Smoke",
      email: `ci.smoke.${String(Date.now())}@example.invalid`,
      password: "strong-pass",
    }),
  });
  if (typeof session.userId !== "string" || session.userId === "") {
    throw new Error("register did not return userId");
  }
  if (typeof session.sessionToken !== "string" || session.sessionToken.split(".").length !== 3) {
    throw new Error("register did not return a JWT");
  }
  const opportunities = await json("/api/opportunities");
  if (!Array.isArray(opportunities)) {
    throw new Error("opportunities list is not an array");
  }
  if (opportunities.length === 0) {
    throw new Error(
      "catalog empty — run migrations including 015_ci_smoke_investigator_row.sql (CI AI_EXTRACTED fixture, not curated seed)",
    );
  }
  const opportunityId = opportunities[0].id;
  if (typeof opportunityId !== "string" || opportunityId === "") {
    throw new Error("first opportunity has no id");
  }
  const analysis = await json(`/api/opportunities/${opportunityId}/analyze`, {
    method: "POST",
    headers: { "X-Hulum-Session": session.sessionToken },
    body: JSON.stringify({ userId: session.userId }),
  });
  if (!["APPLY", "MAYBE", "SKIP"].includes(analysis.decision)) {
    throw new Error(`unexpected decision ${String(analysis.decision)}`);
  }
  console.log(
    `ok: health, registered ${session.userId}, catalog ${String(opportunities.length)}, analyze ${analysis.decision} (CI fixture / investigator; not curated seed)`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
