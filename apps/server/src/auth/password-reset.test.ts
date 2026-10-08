import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import type { MailMessage, Mailer } from "./mailer.js";
import { hashPassword, verifyPassword } from "./password.js";
import {
  RESET_TOKEN_TTL_MS,
  createPasswordResetService,
  hashResetToken,
} from "./password-reset.js";
import type { PasswordResetStore, ResetTokenRow } from "./reset-store.js";
import type { AuthUserRow } from "./store.js";

type TokenRecord = ResetTokenRow & { token_hash: string };

function fixture(options: { mailer?: Mailer | null; logError?: (line: string) => void } = {}) {
  let now = new Date("2026-10-07T12:00:00.000Z");
  const clock = { now: () => now };
  const users = new Map<string, AuthUserRow>();
  const tokens: TokenRecord[] = [];
  const sent: MailMessage[] = [];

  const store: PasswordResetStore = {
    async replaceToken(input) {
      for (const row of tokens) {
        if (row.user_id === input.userId && row.used_at === null) row.used_at = clock.now();
      }
      tokens.push({
        user_id: input.userId,
        token_hash: input.tokenHash,
        expires_at: input.expiresAt,
        used_at: null,
      });
    },
    async findToken(tokenHash) {
      return tokens.find((row) => row.token_hash === tokenHash);
    },
    async consumeTokenAndSetPassword(input) {
      const row = tokens.find((candidate) => candidate.token_hash === input.tokenHash);
      if (row === undefined || row.used_at !== null || row.expires_at <= input.now) return false;
      row.used_at = input.now;
      const user = [...users.values()].find((candidate) => candidate.id === row.user_id);
      if (user === undefined) return false;
      user.password_hash = input.passwordHash;
      return true;
    },
  };

  const defaultMailer: Mailer = {
    async send(message) {
      sent.push(message);
    },
  };

  const service = createPasswordResetService({
    users: {
      async findByEmail(email) {
        return users.get(email.toLowerCase());
      },
    },
    tokens: store,
    mailer: options.mailer === null ? undefined : (options.mailer ?? defaultMailer),
    clientOrigin: "https://hulum.example",
    clock,
    logError: options.logError ?? (() => {}),
  });

  async function addUser(email: string, password: string): Promise<AuthUserRow> {
    const row: AuthUserRow = {
      id: randomUUID(),
      name: "Abeba Tesfaye",
      email,
      password_hash: await hashPassword(password),
      google_sub: null,
    };
    users.set(email, row);
    return row;
  }

  function tokenFrom(message: MailMessage | undefined): string {
    const match = /\/reset-password#token=([A-Za-z0-9_-]+)/.exec(message?.text ?? "");
    if (match?.[1] === undefined) throw new Error("No reset link in email");
    return match[1];
  }

  return {
    service,
    addUser,
    sent,
    tokens,
    tokenFrom,
    advance: (ms: number) => {
      now = new Date(now.getTime() + ms);
    },
  };
}

describe("password reset", () => {
  it("emails a single-use link and stores only the token hash", async () => {
    const f = fixture();
    const user = await f.addUser("abeba@example.invalid", "old-password");

    await f.service.request("  Abeba@Example.invalid ");
    await vi.waitFor(() => expect(f.sent).toHaveLength(1));

    const message = f.sent[0];
    expect(message?.to).toBe("abeba@example.invalid");
    expect(message?.text).toContain("https://hulum.example/reset-password#token=");
    const token = f.tokenFrom(message);
    expect(f.tokens[0]?.token_hash).toBe(hashResetToken(token));
    expect(f.tokens[0]?.token_hash).not.toContain(token);

    expect(await f.service.verify(token)).toBe("valid");
    await f.service.confirm({ token, password: "new-password" });
    expect(await verifyPassword("new-password", user.password_hash ?? "")).toBe(true);
    expect(await verifyPassword("old-password", user.password_hash ?? "")).toBe(false);

    await expect(f.service.confirm({ token, password: "another-pass" })).rejects.toMatchObject({
      statusCode: 400,
      code: "RESET_LINK_INVALID",
    });
  });

  it("does not reveal whether an email has an account", async () => {
    const f = fixture();
    await expect(f.service.request("nobody@example.invalid")).resolves.toBeUndefined();
    expect(f.sent).toHaveLength(0);
    expect(f.tokens).toHaveLength(0);
  });

  it("rejects a malformed email before looking anything up", async () => {
    const f = fixture();
    await expect(f.service.request("not-an-email")).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_INPUT",
      message: "Please enter a valid email address.",
    });
  });

  it("says email is unavailable instead of pretending to send when SMTP is not configured", async () => {
    const f = fixture({ mailer: null });
    await f.addUser("abeba@example.invalid", "old-password");
    for (const email of ["abeba@example.invalid", "nobody@example.invalid"]) {
      await expect(f.service.request(email)).rejects.toMatchObject({
        statusCode: 503,
        code: "MAIL_UNAVAILABLE",
      });
    }
    expect(f.tokens).toHaveLength(0);
  });

  it("tells the user when delivery fails, and logs without the token", async () => {
    const logged: string[] = [];
    const failing: Mailer = {
      async send() {
        throw new Error("SMTP connection refused");
      },
    };
    const f = fixture({ mailer: failing, logError: (line) => logged.push(line) });
    await f.addUser("abeba@example.invalid", "old-password");

    await expect(f.service.request("abeba@example.invalid")).rejects.toMatchObject({
      statusCode: 503,
      code: "MAIL_UNAVAILABLE",
    });
    expect(logged).toEqual(["Password reset email failed: SMTP connection refused"]);
    const storedHash = f.tokens[0]?.token_hash ?? "";
    expect(logged.join("\n")).not.toContain(storedHash);
  });

  it("rejects an expired link with the expired message", async () => {
    const f = fixture();
    await f.addUser("abeba@example.invalid", "old-password");
    await f.service.request("abeba@example.invalid");
    await vi.waitFor(() => expect(f.sent).toHaveLength(1));
    const token = f.tokenFrom(f.sent[0]);

    f.advance(RESET_TOKEN_TTL_MS + 1);
    expect(await f.service.verify(token)).toBe("expired");
    await expect(f.service.confirm({ token, password: "new-password" })).rejects.toMatchObject({
      statusCode: 400,
      code: "RESET_LINK_EXPIRED",
      message: "Your password reset link has expired. Please request a new one.",
    });
  });

  it("enforces the sign-up password rule and keeps the link usable after a weak attempt", async () => {
    const f = fixture();
    await f.addUser("abeba@example.invalid", "old-password");
    await f.service.request("abeba@example.invalid");
    await vi.waitFor(() => expect(f.sent).toHaveLength(1));
    const token = f.tokenFrom(f.sent[0]);

    await expect(f.service.confirm({ token, password: "short" })).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_INPUT",
      message: "Password must be at least 8 characters.",
    });
    expect(await f.service.verify(token)).toBe("valid");
  });

  it("invalidates an older link when a new one is requested", async () => {
    const f = fixture();
    await f.addUser("abeba@example.invalid", "old-password");
    await f.service.request("abeba@example.invalid");
    await vi.waitFor(() => expect(f.sent).toHaveLength(1));
    const first = f.tokenFrom(f.sent[0]);
    await f.service.request("abeba@example.invalid");
    await vi.waitFor(() => expect(f.sent).toHaveLength(2));
    const second = f.tokenFrom(f.sent[1]);

    expect(await f.service.verify(first)).toBe("invalid");
    expect(await f.service.verify(second)).toBe("valid");
  });

  it("treats a malformed token as invalid without a lookup", async () => {
    const f = fixture();
    expect(await f.service.verify("../../etc/passwd")).toBe("invalid");
    expect(await f.service.verify("")).toBe("invalid");
  });
});
