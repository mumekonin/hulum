import type { LanguageCode } from "@hulum/shared";
import { isLanguageCode } from "./languages";

const USER_KEY = "hulum.userId";
const SESSION_KEY = "hulum.sessionToken";
const LANGUAGE_KEY = "hulum.language";

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USER_KEY);
}

export function setUserId(userId: string): void {
  window.localStorage.setItem(USER_KEY, userId);
}

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
}

export function setSessionToken(token: string | undefined | null): void {
  if (typeof window === "undefined") return;
  if (token === undefined || token === null || token.trim() === "") {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, token);
}

export function requireUserId(): string {
  const existing = getUserId();
  if (existing) return existing;
  const userId = crypto.randomUUID();
  setUserId(userId);
  return userId;
}

export function getLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANGUAGE_KEY);
  return isLanguageCode(stored) ? stored : "en";
}

export function setLanguage(language: LanguageCode): void {
  window.localStorage.setItem(LANGUAGE_KEY, language);
}
