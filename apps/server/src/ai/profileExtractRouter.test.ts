import express from "express";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import type { ChatClient } from "./groq.js";
import { createProfileExtractRouter } from "./profileExtractRouter.js";

describe("POST /api/ai/profile-extract", () => {
  let closeServer: (() => Promise<void>) | undefined;

  afterEach(async () => {
    if (closeServer) {
      await closeServer();
      closeServer = undefined;
    }
  });

  it("returns proposed fields without persisting a profile", async () => {
    const chat: ChatClient = {
      complete: async () =>
        JSON.stringify({
          educationLevel: "bachelor_in_progress",
          fieldOfStudy: "Computer Science",
          graduationYear: 2027,
          country: "Ethiopia",
          city: "Addis Ababa",
          languages: ["English", "Amharic"],
          skills: ["Python"],
          experience: "One internship",
          interests: ["AI"],
        }),
    };

    const app = express();
    app.use(express.json());
    app.use("/api/ai", createProfileExtractRouter(chat));
    app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const status =
        err && typeof err === "object" && "statusCode" in err && typeof err.statusCode === "number"
          ? err.statusCode
          : 500;
      const code =
        err && typeof err === "object" && "code" in err && typeof err.code === "string"
          ? err.code
          : "INTERNAL_ERROR";
      const message = err instanceof Error ? err.message : "error";
      res.status(status).json({ data: null, error: { code, message } });
    });

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
      throw new Error("Expected TCP address");
    }
    const baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;

    const response = await fetch(`${baseUrl}/api/ai/profile-extract`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: "I am a Computer Science student in Addis Ababa, Ethiopia. I speak English and Amharic.",
      }),
    });
    const body = (await response.json()) as {
      data: {
        confirmationRequired: boolean;
        proposed: { fieldOfStudy: string | null; country: string | null };
        filledFields: string[];
        notice: string;
      };
    };

    expect(response.status).toBe(200);
    expect(body.data.confirmationRequired).toBe(true);
    expect(body.data.proposed.fieldOfStudy).toBe("Computer Science");
    expect(body.data.proposed.country).toBe("Ethiopia");
    expect(body.data.filledFields.length).toBeGreaterThan(0);
    expect(body.data.notice.toLowerCase()).toContain("confirm");
  });
});
