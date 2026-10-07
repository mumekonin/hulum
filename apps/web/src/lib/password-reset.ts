import { PASSWORD_MIN_LENGTH } from "@hulum/shared";
import type { ApiClientError } from "./api";
import { NETWORK_MESSAGE } from "./api";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const GENERIC_RESET_ERROR = "Something went wrong. Please try again.";
export const RESET_LINK_EXPIRED_MESSAGE =
  "Your password reset link has expired. Please request a new one.";
export const RESET_LINK_INVALID_MESSAGE = "Your reset link is invalid or has expired.";

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** Messages the server already words for users; anything else gets the generic line. */
export function resetRequestErrorMessage(error: ApiClientError | undefined): string {
  if (error === undefined) return GENERIC_RESET_ERROR;
  if (error.code === "NETWORK") return NETWORK_MESSAGE;
  if (
    error.code === "INVALID_INPUT" ||
    error.code === "MAIL_UNAVAILABLE" ||
    error.code === "RATE_LIMITED"
  ) {
    return error.message;
  }
  return GENERIC_RESET_ERROR;
}

export type ResetLinkProblem = "expired" | "invalid";

export function resetLinkProblem(error: ApiClientError | undefined): ResetLinkProblem | undefined {
  if (error?.code === "RESET_LINK_EXPIRED") return "expired";
  if (error?.code === "RESET_LINK_INVALID") return "invalid";
  return undefined;
}

/** Same rule as sign-up (server `assertPasswordStrength`), checked first so users see it before submitting. */
export function newPasswordError(password: string, confirm: string): string | null {
  if (password === "") return "Enter a new password.";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${String(PASSWORD_MIN_LENGTH)} characters.`;
  }
  if (confirm === "") return "Confirm your new password.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

/** Reads `#token=…` from the emailed link. The fragment never reaches a server log. */
export function readResetTokenFromHash(hash: string): string | null {
  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const token = params.get("token")?.trim();
  return token ? token : null;
}
