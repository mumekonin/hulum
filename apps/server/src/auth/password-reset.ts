import { createHash, randomBytes } from "node:crypto";
import { HttpError } from "../http/errors.js";
import type { Clock } from "../services/common/clock.js";
import { systemClock } from "../services/common/clock.js";
import type { Mailer } from "./mailer.js";
import { hashPassword } from "./password.js";
import type { PasswordResetStore } from "./reset-store.js";
import type { AuthStore } from "./store.js";

export const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 32 random bytes, base64url. Anything else cannot be one of our tokens. */
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export const RESET_LINK_EXPIRED_MESSAGE =
  "Your password reset link has expired. Please request a new one.";
export const RESET_LINK_INVALID_MESSAGE = "Your reset link is invalid or has expired.";

export type ResetTokenStatus = "valid" | "expired" | "invalid";

export type PasswordResetService = {
  /** Same outcome whether or not the email has an account (no enumeration). */
  request(email: string): Promise<void>;
  verify(token: string): Promise<ResetTokenStatus>;
  confirm(input: { token: string; password: string }): Promise<void>;
};

export type PasswordResetDeps = {
  users: Pick<AuthStore, "findByEmail">;
  tokens: PasswordResetStore;
  /** Undefined until SMTP is configured; requests then fail with MAIL_UNAVAILABLE instead of faking a send. */
  mailer: Mailer | undefined;
  /** Web origin (CLIENT_URL) that serves /reset-password. */
  clientOrigin: string;
  clock?: Clock;
  logError?: (message: string) => void;
};

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function resetEmail(name: string, link: string): { subject: string; text: string; html: string } {
  const minutes = String(RESET_TOKEN_TTL_MS / 60_000);
  const subject = "Reset your HULUM password";
  const text = [
    `Hi ${name},`,
    "",
    "Someone asked to reset the password for your HULUM account.",
    `Open this link within ${minutes} minutes to choose a new password:`,
    "",
    link,
    "",
    "If you did not ask for this, ignore this email. Your password will not change.",
  ].join("\n");
  const html = `<p>Hi ${escapeHtml(name)},</p>
<p>Someone asked to reset the password for your HULUM account.</p>
<p>Open this link within ${minutes} minutes to choose a new password:</p>
<p><a href="${escapeHtml(link)}">Reset your password</a></p>
<p>If you did not ask for this, ignore this email. Your password will not change.</p>`;
  return { subject, text, html };
}

export function createPasswordResetService(deps: PasswordResetDeps): PasswordResetService {
  const clock = deps.clock ?? systemClock;
  const logError = deps.logError ?? ((message: string) => console.error(message));

  async function status(token: string): Promise<ResetTokenStatus> {
    if (!TOKEN_PATTERN.test(token)) return "invalid";
    const row = await deps.tokens.findToken(hashResetToken(token));
    if (row === undefined || row.used_at !== null) return "invalid";
    if (row.expires_at.getTime() <= clock.now().getTime()) return "expired";
    return "valid";
  }

  function rejectStatus(result: Exclude<ResetTokenStatus, "valid">): never {
    if (result === "expired") {
      throw new HttpError(400, "RESET_LINK_EXPIRED", RESET_LINK_EXPIRED_MESSAGE);
    }
    throw new HttpError(400, "RESET_LINK_INVALID", RESET_LINK_INVALID_MESSAGE);
  }

  return {
    async request(rawEmail): Promise<void> {
      const email = rawEmail.trim().toLowerCase();
      if (!EMAIL_PATTERN.test(email)) {
        throw new HttpError(400, "INVALID_INPUT", "Please enter a valid email address.");
      }
      const mailer = deps.mailer;
      if (mailer === undefined) {
        throw new HttpError(
          503,
          "MAIL_UNAVAILABLE",
          "Password reset email isn't available on this HULUM server yet. Please try again later.",
        );
      }
      const user = await deps.users.findByEmail(email);
      if (user === undefined) return;

      const token = randomBytes(32).toString("base64url");
      await deps.tokens.replaceToken({
        userId: user.id,
        tokenHash: hashResetToken(token),
        expiresAt: new Date(clock.now().getTime() + RESET_TOKEN_TTL_MS),
      });
      // Fragment, not query: keeps the token out of web-server access logs and Referer headers.
      const link = `${deps.clientOrigin}/reset-password#token=${token}`;
      const message = resetEmail(user.name, link);
      try {
        await mailer.send({ to: user.email, ...message });
      } catch (error: unknown) {
        const reason = error instanceof Error ? error.message : "unknown error";
        logError(`Password reset email failed: ${reason}`);
        const loginRejected = /535|BadCredentials|Invalid login|not accepted/i.test(reason);
        throw new HttpError(
          503,
          "MAIL_UNAVAILABLE",
          loginRejected
            ? "Gmail rejected the sender login. The address you entered is fine. Update the mail app password in the server settings, restart the API, and try again."
            : "HULUM could not send the reset email. Please try again.",
        );
      }
    },

    async verify(token): Promise<ResetTokenStatus> {
      return status(token);
    },

    async confirm(input): Promise<void> {
      const before = await status(input.token);
      if (before !== "valid") rejectStatus(before);
      let passwordHash: string;
      try {
        passwordHash = await hashPassword(input.password);
      } catch (error) {
        throw new HttpError(
          400,
          "INVALID_INPUT",
          error instanceof Error ? error.message : "Password is not valid.",
        );
      }
      const updated = await deps.tokens.consumeTokenAndSetPassword({
        tokenHash: hashResetToken(input.token),
        passwordHash,
        now: clock.now(),
      });
      if (!updated) {
        // Lost a race with another submit or the link expired while hashing.
        const after = await status(input.token);
        rejectStatus(after === "expired" ? "expired" : "invalid");
      }
    },
  };
}
