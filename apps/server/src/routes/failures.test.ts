import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { mutateStore, resetStoreForTests } from "../store/fileStore.js";

describe("analysis failure paths", () => {
  let closeServer: (() => Promise<void>) | undefined;
  let baseUrl = "";
  let tmpDir = "";

  beforeEach(async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), "hulum-fail-"));
    process.env.STORE_PATH = path.join(tmpDir, "store.json");
    delete process.env.VOXIDE_API_KEY;
    resetStoreForTests();

    const server = createServer(createApp({ store: "file" }));
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
    baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (closeServer) {
      await closeServer();
      closeServer = undefined;
    }
    resetStoreForTests();
    if (tmpDir) {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  async function demoUserId() {
    const demo = await fetch(`${baseUrl}/api/profile/demo`, { method: "POST" });
    const body = (await demo.json()) as { data: { userId: string } };
    expect(demo.status).toBe(201);
    return body.data.userId;
  }

  async function analyze(userId: string, opportunityId: string) {
    const response = await fetch(`${baseUrl}/api/opportunities/${opportunityId}/analyze`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const body = (await response.json()) as {
      data: {
        decision: string;
        requirements: Array<{ key?: string; status: string }>;
      };
    };
    expect(response.status).toBe(201);
    return body.data;
  }

  it("returns MAYBE when a stored requirement is UNCERTAIN", async () => {
    const userId = await demoUserId();
    const result = await analyze(userId, "opp-mastercard-uct");
    expect(result.decision).toBe("MAYBE");
    expect(result.requirements.some((item) => item.status === "UNCERTAIN")).toBe(true);
  });

  it("returns SKIP when a critical requirement is NOT_MET", async () => {
    const userId = await demoUserId();
    const result = await analyze(userId, "opp-chevening");
    expect(result.decision).toBe("SKIP");
    expect(result.requirements.some((item) => item.status === "NOT_MET")).toBe(true);
  });

  it("returns SKIP when the official deadline has passed", async () => {
    const userId = await demoUserId();
    await mutateStore((store) => {
      const item = store.opportunities.find((row) => row.id === "opp-a2sv");
      if (item) item.deadline = "2020-01-01";
    });
    const result = await analyze(userId, "opp-a2sv");
    expect(result.decision).toBe("SKIP");
    expect(result.requirements.some((item) => item.status === "NOT_MET")).toBe(true);
  });

  it("keeps text-fallback when Voxide is not configured", async () => {
    const userId = await demoUserId();
    const session = await fetch(`${baseUrl}/api/voice/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId, language: "en" }),
    });
    const body = (await session.json()) as { data: { provider: string } };
    expect(session.status).toBe(201);
    expect(body.data.provider).toBe("text-fallback");
  });

  it("keeps contradictory profile experience UNCERTAIN instead of inventing MET", async () => {
    const created = await fetch(`${baseUrl}/api/profile`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userId: "user_contradict_xp",
        name: "Contradiction Case",
        educationLevel: "bachelor",
        fieldOfStudy: "Computer Science",
        graduationYear: 2022,
        country: "Ethiopia",
        languages: ["English"],
        preferredLanguage: "en",
        yearsExperience: 5,
        experience: "No work experience.",
      }),
    });
    expect(created.ok).toBe(true);

    const result = await analyze("user_contradict_xp", "opp-chevening");
    const experience = result.requirements.find((item) => item.key === "experience");
    expect(experience?.status).toBe("UNCERTAIN");
    expect(result.decision).toBe("MAYBE");
  });
});
