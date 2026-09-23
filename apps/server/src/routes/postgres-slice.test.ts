import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Decision, type Analysis, type Opportunity, type ProfileView, type ReadinessItem } from "@hulum/shared";
import { config as loadDotenv } from "dotenv";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { closePool, getPool } from "../db/pool.js";
import { decide } from "../decision/decide.js";
import { systemClock } from "../services/common/clock.js";

loadDotenv({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env"),
});

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());

type Envelope<T> = {
  data: T | null;
  error: { message: string; code?: string } | null;
};

/**
 * Task 36. One HTTP pass through the Postgres API that `npm run dev` boots.
 * The fixture opportunity is deleted afterward. It is not a catalog seed.
 * Voice stays off this server (ADR 001). Text voice is covered by the file-store flow test.
 * Skips when DATABASE_URL is unset so local/CI unit gates still pass without Postgres.
 */
describe.skipIf(!hasDatabaseUrl)("postgres vertical slice", () => {
  let closeServer: (() => Promise<void>) | undefined;
  let userId: string | undefined;
  let opportunityId: string | undefined;

  afterEach(async () => {
    if (closeServer) {
      await closeServer();
      closeServer = undefined;
    }
    if (userId !== undefined) {
      await getPool().query("delete from users where id = $1", [userId]);
      userId = undefined;
    }
    if (opportunityId !== undefined) {
      await getPool().query("delete from opportunities where id = $1", [opportunityId]);
      opportunityId = undefined;
    }
  });

  afterAll(async () => {
    await closePool();
  });

  it("persists profile, decide(), readiness, and a stored explanation decision", async () => {
    const inserted = await getPool().query<{ id: string }>(
      `insert into opportunities (
         title, organization, type, description, deadline,
         country_eligibility, education_requirements, field_requirements, language_requirements,
         source_url, verification_status
       ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       returning id`,
      [
        "HULUM integration fixture (deleted after test)",
        "HULUM",
        "fellowship",
        "Temporary row for the Postgres slice test. Not a real opportunity.",
        "2026-12-31",
        ["ET"],
        ["university_student"],
        ["computer_science"],
        ["en"],
        "https://example.invalid/hulum-task-36-fixture",
        "NEEDS_REVIEW",
      ],
    );
    opportunityId = inserted.rows[0]?.id;
    expect(opportunityId).toBeTruthy();

    const server = createServer(createApp({ store: "postgres" }));
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });
    closeServer = () =>
      new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    const address = server.address();
    if (address === null || typeof address === "string") {
      throw new Error("Expected a TCP address for the test server");
    }
    const baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;

    const email = `hulum-slice-${opportunityId}@example.invalid`;
    const created = await fetch(`${baseUrl}/api/profile`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "HULUM Slice",
        email,
        educationLevel: "university_student",
        fieldOfStudy: "computer_science",
        graduationYear: 2027,
        country: "ET",
        city: "Addis Ababa",
        languages: ["en"],
        skills: ["python"],
        experience: "1 internship",
        interests: ["ai"],
      }),
    });
    const createdBody = (await created.json()) as Envelope<ProfileView>;
    expect(created.status).toBe(201);
    expect(createdBody.data?.profile.userId).toBeTruthy();
    userId = createdBody.data?.profile.userId;

    const loaded = await fetch(`${baseUrl}/api/opportunities/${opportunityId}`);
    const loadedBody = (await loaded.json()) as Envelope<Opportunity>;
    expect(loaded.status).toBe(200);
    expect(loadedBody.data?.sourceUrl).toBe("https://example.invalid/hulum-task-36-fixture");

    const analyzed = await fetch(`${baseUrl}/api/opportunities/${opportunityId}/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const analyzedBody = (await analyzed.json()) as Envelope<Analysis>;
    expect(analyzed.status).toBe(201);
    const analysis = analyzedBody.data;
    expect(analysis).toBeTruthy();
    if (analysis === null || createdBody.data === null || loadedBody.data === null) {
      throw new Error("Profile, opportunity, and analysis must be present");
    }

    const engine = decide(createdBody.data.profile, loadedBody.data, systemClock);
    expect(analysis.decision).toBe(engine.decision);
    expect(analysis.fitScore).toBe(engine.fitScore);
    expect(analysis.decision).toMatch(/^(APPLY|MAYBE|SKIP)$/);
    expect(analysis.requirements?.length).toBeGreaterThan(0);
    expect(analysis.readiness?.length).toBeGreaterThan(0);

    const stored = await getPool().query<{ decision: string; fit_score: number }>(
      "select decision, fit_score from analyses where id = $1 and user_id = $2",
      [analysis.id, userId],
    );
    expect(stored.rows[0]?.decision).toBe(engine.decision);
    expect(stored.rows[0]?.fit_score).toBe(engine.fitScore);

    const requirementCount = await getPool().query<{ count: string }>(
      "select count(*)::text as count from requirement_results where analysis_id = $1",
      [analysis.id],
    );
    expect(Number(requirementCount.rows[0]?.count)).toBeGreaterThan(0);

    const readiness = await fetch(`${baseUrl}/api/analyses/${analysis.id}/readiness`);
    const readinessBody = (await readiness.json()) as Envelope<ReadinessItem[]>;
    expect(readiness.status).toBe(200);
    const item = readinessBody.data?.[0];
    expect(item?.id).toBeTruthy();

    const patched = await fetch(`${baseUrl}/api/readiness/${item?.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "DONE" }),
    });
    const patchedBody = (await patched.json()) as Envelope<ReadinessItem>;
    expect(patched.status).toBe(200);
    expect(patchedBody.data?.status).toBe("DONE");

    const readinessAgain = await fetch(`${baseUrl}/api/analyses/${analysis.id}/readiness`);
    const readinessAgainBody = (await readinessAgain.json()) as Envelope<ReadinessItem[]>;
    expect(readinessAgainBody.data?.find((row) => row.id === item?.id)?.status).toBe("DONE");

    const explained = await fetch(`${baseUrl}/api/analyses/${analysis.id}/explain`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ language: "en" }),
    });
    const explainedBody = (await explained.json()) as Envelope<{ decision: string }>;
    if (explained.status === 200) {
      expect(explainedBody.data?.decision).toBe(engine.decision);
    } else {
      expect(explained.status).toBe(503);
      expect(explainedBody.error?.code).toBe("AI_UNAVAILABLE");
    }

    const afterExplain = await getPool().query<{ decision: string }>(
      "select decision from analyses where id = $1",
      [analysis.id],
    );
    expect(afterExplain.rows[0]?.decision).toBe(engine.decision);
    expect(afterExplain.rows[0]?.decision).not.toBe(undefined);
    expect([Decision.APPLY, Decision.MAYBE, Decision.SKIP]).toContain(afterExplain.rows[0]?.decision);
  }, 30000);
});
