import { describe, expect, it } from "vitest";
import { HttpError } from "../http/errors.js";
import { issueJwt, issueOauthState, verifyJwt, verifyOauthState } from "./jwt.js";

describe("JWT", () => {
  const secret = "test-jwt-secret";

  it("round-trips claims", () => {
    const token = issueJwt({ sub: "user-1", typ: "session" }, secret);
    expect(token.split(".").length).toBe(3);
    const claims = verifyJwt(token, secret);
    expect(claims.sub).toBe("user-1");
    expect(claims.typ).toBe("session");
  });

  it("rejects a tampered token", () => {
    const token = issueJwt({ sub: "user-1", typ: "session" }, secret);
    expect(() => verifyJwt(`${token}x`, secret)).toThrow(HttpError);
  });

  it("rejects an expired token", () => {
    const token = issueJwt({ sub: "user-1", typ: "session" }, secret, -10);
    expect(() => verifyJwt(token, secret)).toThrow(/expired/);
  });

  it("round-trips oauth state", () => {
    const state = issueOauthState(secret);
    expect(() => verifyOauthState(state, secret)).not.toThrow();
    expect(() => verifyOauthState(issueJwt({ typ: "session" }, secret), secret)).toThrow(/state/);
  });
});
