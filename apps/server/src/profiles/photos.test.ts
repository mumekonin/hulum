import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import type { ProfileView } from "@hulum/shared";
import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import { errorHandler, notFoundHandler } from "../http/error-handler.js";
import { createProfileRouter } from "./index.js";
import { parsePhotoUpload, type PhotoStore } from "./photos.js";
import type { ProfileService } from "./service.js";

const PNG_1X1 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const PDF_HEADER = Buffer.from("%PDF-1.4 not an image, padded for length").toString("base64");

const userId = "11111111-1111-4111-8111-111111111111";

const view = { name: "Test User", email: "t@example.invalid" } as unknown as ProfileView;
const service: ProfileService = {
  create: async () => view,
  getByUserId: async () => view,
  getByEmail: async () => undefined,
  update: async () => view,
};

function memoryPhotos(): PhotoStore {
  const rows = new Map<string, { mimeType: string; bytes: Buffer; updatedAt: string }>();
  let tick = 0;
  return {
    async updatedAt(owner) {
      return rows.get(owner)?.updatedAt ?? null;
    },
    async get(owner) {
      return rows.get(owner);
    },
    async put(input) {
      tick += 1;
      const updatedAt = new Date(Date.UTC(2026, 9, 7, 0, 0, tick)).toISOString();
      rows.set(input.userId, { mimeType: input.mimeType, bytes: input.bytes, updatedAt });
      return { updatedAt };
    },
    async remove(owner) {
      return rows.delete(owner);
    },
  };
}

describe("parsePhotoUpload", () => {
  it("accepts a real PNG", () => {
    const parsed = parsePhotoUpload({ mimeType: "image/png", fileBase64: PNG_1X1 });
    expect(parsed.mimeType).toBe("image/png");
  });

  it("rejects a PDF and a file whose bytes don't match the declared type", () => {
    expect(() => parsePhotoUpload({ mimeType: "application/pdf", fileBase64: PDF_HEADER })).toThrow(
      /JPG, PNG, or WebP/,
    );
    expect(() => parsePhotoUpload({ mimeType: "image/png", fileBase64: PDF_HEADER })).toThrow(
      /isn't a JPG, PNG, or WebP/,
    );
  });
});

describe("profile photo routes", () => {
  let closeServer: (() => Promise<void>) | undefined;

  afterEach(async () => {
    await closeServer?.();
    closeServer = undefined;
  });

  async function listen(): Promise<string> {
    const app = express();
    app.use(express.json({ limit: "8mb" }));
    app.use("/api/profile", createProfileRouter(service, undefined, memoryPhotos()));
    app.use(notFoundHandler);
    app.use(errorHandler);
    const server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    closeServer = () => new Promise((resolve) => server.close(() => resolve()));
    return `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/profile/${userId}/photo`;
  }

  it("has no photo, stores one, replaces it, and removes it", async () => {
    const url = await listen();
    expect((await fetch(url)).status).toBe(404);

    const put = (fileBase64: string) =>
      fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mimeType: "image/png", fileBase64 }),
      });
    const first = await put(PNG_1X1);
    expect(first.status).toBe(200);
    const firstAt = ((await first.json()) as { data: { photoUpdatedAt: string } }).data
      .photoUpdatedAt;

    const second = await put(PNG_1X1);
    const secondAt = ((await second.json()) as { data: { photoUpdatedAt: string } }).data
      .photoUpdatedAt;
    expect(secondAt > firstAt).toBe(true);

    const file = await fetch(url);
    expect(file.status).toBe(200);
    expect(file.headers.get("content-type")).toBe("image/png");
    expect(file.headers.get("x-content-type-options")).toBe("nosniff");

    expect((await fetch(url, { method: "DELETE" })).status).toBe(200);
    expect((await fetch(url)).status).toBe(404);
  });

  it("rejects a non-image upload with 422", async () => {
    const url = await listen();
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mimeType: "image/png", fileBase64: PDF_HEADER }),
    });
    expect(response.status).toBe(422);
  });
});
