import { describe, expect, it } from "vitest";
import { googleAuthorizeUrl, googleRedirectUri } from "./google.js";

describe("Google OAuth helpers", () => {
  it("builds the authorize URL with the registered redirect", () => {
    const url = new URL(
      googleAuthorizeUrl({
        clientId: "test-client-id",
        redirectUri: googleRedirectUri(3001),
        state: "signed-state",
      }),
    );
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url.searchParams.get("client_id")).toBe("test-client-id");
    expect(url.searchParams.get("redirect_uri")).toBe("http://localhost:3001/api/auth/google/callback");
    expect(url.searchParams.get("scope")).toContain("email");
    expect(url.searchParams.get("state")).toBe("signed-state");
  });
});
