import { describe, expect, it } from "vitest";
import { allowedOrigins } from "./cors.js";

describe("allowedOrigins", () => {
  it("uses CLIENT_URL when set", () => {
    expect(
      allowedOrigins({ NODE_ENV: "production", CLIENT_URL: "https://hulum.example.invalid" }),
    ).toEqual(["https://hulum.example.invalid"]);
  });

  it("allows local web origins in development when CLIENT_URL is unset", () => {
    expect(allowedOrigins({ NODE_ENV: "development", CLIENT_URL: undefined })).toEqual([
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]);
  });

  it("allows no browser origins in production when CLIENT_URL is unset", () => {
    expect(allowedOrigins({ NODE_ENV: "production", CLIENT_URL: undefined })).toEqual([]);
  });
});
