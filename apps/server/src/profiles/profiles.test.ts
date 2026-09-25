import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { ProfileView } from "@hulum/shared";
import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import { errorHandler, notFoundHandler } from "../http/error-handler.js";
import { createProfileRouter } from "./index.js";
import type { ProfileService } from "./service.js";

const view: ProfileView = {
  name: "Test User",
  email: "test@example.invalid",
  profile: {
    id: "22222222-2222-4222-8222-222222222222",
    userId: "11111111-1111-4111-8111-111111111111",
    educationLevel: "university_student",
    fieldOfStudy: "computer_science",
    graduationYear: 2027,
    country: "ET",
    city: "Addis Ababa",
    languages: ["en"],
    skills: ["python"],
    experience: "1 internship",
    interests: ["ai"],
    createdAt: "2026-09-19T00:00:00.000Z",
    updatedAt: "2026-09-19T00:00:00.000Z",
  },
  completeness: { complete: true, missing: [] },
};

function createTestApp(service: ProfileService): express.Express {
  const app = express();
  app.use(express.json());
  app.use("/api/profile", createProfileRouter(service));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

describe("profile routes", () => {
  let closeServer: (() => Promise<void>) | undefined;

  afterEach(async () => {
    if (closeServer) {
      await closeServer();
      closeServer = undefined;
    }
  });

  async function listen(app: express.Express): Promise<number> {
    const server = createServer(app);
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
    return (address as AddressInfo).port;
  }

  it("creates a profile", async () => {
    const port = await listen(
      createTestApp({
        create: async () => view,
        getByUserId: async () => view,
        getByEmail: async () => undefined,
        update: async () => view,
      }),
    );
    const response = await fetch(`http://127.0.0.1:${port}/api/profile`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.invalid",
        country: "ET",
      }),
    });
    const body: unknown = await response.json();
    expect(response.status).toBe(201);
    expect(body).toEqual({ data: view, error: null });
  });

  it("rejects a create with no name", async () => {
    const port = await listen(
      createTestApp({
        create: async () => view,
        getByUserId: async () => view,
        getByEmail: async () => undefined,
        update: async () => view,
      }),
    );
    const response = await fetch(`http://127.0.0.1:${port}/api/profile`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "test@example.invalid" }),
    });
    expect(response.status).toBe(400);
  });

  it("returns 404 when the profile does not exist", async () => {
    const port = await listen(
      createTestApp({
        create: async () => view,
        getByUserId: async () => undefined,
        getByEmail: async () => undefined,
        update: async () => undefined,
      }),
    );
    const response = await fetch(
      `http://127.0.0.1:${port}/api/profile/11111111-1111-4111-8111-111111111111`,
    );
    const body: unknown = await response.json();
    expect(response.status).toBe(404);
    expect(body).toEqual({
      data: null,
      error: { code: "NOT_FOUND", message: "Profile not found." },
    });
  });

  it("does not expose a demo credential route", async () => {
    const port = await listen(
      createTestApp({
        create: async () => view,
        getByUserId: async () => view,
        getByEmail: async () => undefined,
        update: async () => view,
      }),
    );
    const response = await fetch(`http://127.0.0.1:${port}/api/profile/demo`, { method: "POST" });
    expect(response.status).toBe(404);
  });
});
