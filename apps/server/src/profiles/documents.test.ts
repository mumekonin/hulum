import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { ProfileDocument, ProfileView } from "@hulum/shared";
import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import { errorHandler, notFoundHandler } from "../http/error-handler.js";
import { createProfileRouter } from "./index.js";
import type { DocumentStore } from "./documents.js";
import { parseDocumentUpload } from "./documents.js";
import type { ProfileService } from "./service.js";

const PNG_1X1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const userId = "11111111-1111-4111-8111-111111111111";

const view: ProfileView = {
  name: "Test User",
  email: "test@example.invalid",
  profile: {
    id: "22222222-2222-4222-8222-222222222222",
    userId,
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

const service: ProfileService = {
  create: async () => view,
  getByUserId: async () => view,
  getByEmail: async () => undefined,
  update: async () => view,
};

function createMemoryDocuments(): DocumentStore {
  const rows = new Map<
    string,
    { meta: ProfileDocument; bytes: Buffer; mimeType: string; text: string | null; status: string }
  >();
  return {
    async list(ownerId) {
      return [...rows.values()]
        .filter((row) => row.meta.userId === ownerId)
        .map((row) => row.meta);
    },
    async labels(ownerId) {
      return [...new Set((await this.list(ownerId)).map((row) => row.label))];
    },
    async texts(ownerId) {
      return [...rows.values()]
        .filter((row) => row.meta.userId === ownerId && row.status === "ready" && row.text)
        .map((row) => ({ label: row.meta.label, text: row.text as string }));
    },
    async ensureExtracted() {
      // Memory fixture has no extract pipeline.
    },
    async create(input) {
      const meta: ProfileDocument = {
        id: "33333333-3333-4333-8333-333333333333",
        userId: input.userId,
        label: input.label,
        mimeType: input.mimeType,
        createdAt: "2026-09-25T00:00:00.000Z",
      };
      rows.set(meta.id, { meta, bytes: input.bytes, mimeType: input.mimeType, text: null, status: "empty" });
      return meta;
    },
    async getFile(ownerId, documentId) {
      const row = rows.get(documentId);
      if (row === undefined || row.meta.userId !== ownerId) {
        return undefined;
      }
      return { mimeType: row.mimeType, bytes: row.bytes };
    },
    async remove(ownerId, documentId) {
      const row = rows.get(documentId);
      if (row === undefined || row.meta.userId !== ownerId) {
        return false;
      }
      rows.delete(documentId);
      return true;
    },
  };
}

describe("parseDocumentUpload", () => {
  it("accepts a JPEG/PNG/WebP/PDF payload", () => {
    const parsed = parseDocumentUpload({
      label: "CV",
      mimeType: "image/png",
      fileBase64: PNG_1X1,
    });
    expect(parsed.label).toBe("CV");
    expect(parsed.mimeType).toBe("image/png");
    expect(parsed.bytes.length).toBeGreaterThan(0);
  });

  it("rejects a text-only body", () => {
    expect(() => parseDocumentUpload({ label: "CV" })).toThrow(/Upload a JPEG/);
  });
});

describe("profile document routes", () => {
  let closeServer: (() => Promise<void>) | undefined;

  afterEach(async () => {
    if (closeServer) {
      await closeServer();
      closeServer = undefined;
    }
  });

  async function listen(): Promise<number> {
    const app = express();
    app.use(express.json({ limit: "5mb" }));
    app.use("/api/profile", createProfileRouter(service, createMemoryDocuments()));
    app.use(notFoundHandler);
    app.use(errorHandler);
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

  it("stores a document photo and returns it", async () => {
    const port = await listen();
    const created = await fetch(`http://127.0.0.1:${port}/api/profile/${userId}/documents`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        label: "CV",
        mimeType: "image/png",
        fileBase64: PNG_1X1,
      }),
    });
    expect(created.status).toBe(201);
    const body = (await created.json()) as { data: ProfileDocument };
    expect(body.data.label).toBe("CV");
    expect(body.data.mimeType).toBe("image/png");

    const file = await fetch(
      `http://127.0.0.1:${port}/api/profile/${userId}/documents/${body.data.id}`,
    );
    expect(file.status).toBe(200);
    expect(file.headers.get("content-type")).toBe("image/png");
    const bytes = Buffer.from(await file.arrayBuffer());
    expect(bytes.equals(Buffer.from(PNG_1X1, "base64"))).toBe(true);
  });

  it("lists and deletes a stored document", async () => {
    const port = await listen();
    await fetch(`http://127.0.0.1:${port}/api/profile/${userId}/documents`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        label: "Transcript",
        mimeType: "image/png",
        fileBase64: PNG_1X1,
      }),
    });
    const listed = await fetch(`http://127.0.0.1:${port}/api/profile/${userId}/documents`);
    const listedBody = (await listed.json()) as { data: ProfileDocument[] };
    expect(listedBody.data).toHaveLength(1);
    expect(listedBody.data[0]?.label).toBe("Transcript");

    const removed = await fetch(
      `http://127.0.0.1:${port}/api/profile/${userId}/documents/${listedBody.data[0]?.id}`,
      { method: "DELETE" },
    );
    expect(removed.status).toBe(200);
    const empty = await fetch(`http://127.0.0.1:${port}/api/profile/${userId}/documents`);
    const emptyBody = (await empty.json()) as { data: ProfileDocument[] };
    expect(emptyBody.data).toHaveLength(0);
  });
});
