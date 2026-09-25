import { HttpError } from "../http/errors.js";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string;
};

export function googleRedirectUri(port: number): string {
  return `http://localhost:${String(port)}/api/auth/google/callback`;
}

export function googleAuthorizeUrl(input: { clientId: string; redirectUri: string; state: string }): string {
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", input.state);
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export async function exchangeGoogleCode(input: {
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}): Promise<GoogleProfile> {
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: input.code,
      client_id: input.clientId,
      client_secret: input.clientSecret,
      redirect_uri: input.redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) {
    throw new HttpError(401, "UNAUTHORIZED", "Google sign-in could not be completed.");
  }
  const tokenBody = (await tokenResponse.json()) as { access_token?: unknown };
  if (typeof tokenBody.access_token !== "string" || tokenBody.access_token.trim() === "") {
    throw new HttpError(401, "UNAUTHORIZED", "Google sign-in could not be completed.");
  }

  const userResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenBody.access_token}` },
  });
  if (!userResponse.ok) {
    throw new HttpError(401, "UNAUTHORIZED", "Google sign-in could not be completed.");
  }
  const profile = (await userResponse.json()) as {
    sub?: unknown;
    email?: unknown;
    email_verified?: unknown;
    name?: unknown;
  };
  if (profile.email_verified !== true) {
    throw new HttpError(401, "UNAUTHORIZED", "Google did not verify this email address.");
  }
  if (typeof profile.sub !== "string" || profile.sub.trim() === "") {
    throw new HttpError(401, "UNAUTHORIZED", "Google sign-in could not be completed.");
  }
  if (typeof profile.email !== "string" || !profile.email.includes("@")) {
    throw new HttpError(401, "UNAUTHORIZED", "Google did not return an email address.");
  }
  const name =
    typeof profile.name === "string" && profile.name.trim().length >= 2
      ? profile.name.trim()
      : profile.email.split("@")[0] ?? "HULUM user";
  return { sub: profile.sub, email: profile.email, name };
}
