import type { LanguageCode } from "@hulum/shared";
import { isLanguageCode } from "./languages";
import { RECENT_QUESTIONS_PREFIX } from "./recent-questions";

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

export function persistAuthSession(session: { userId: string; sessionToken: string }): void {
  setUserId(session.userId);
  setSessionToken(session.sessionToken);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  const userId = window.localStorage.getItem(USER_KEY);
  if (userId !== null) window.localStorage.removeItem(`${RECENT_QUESTIONS_PREFIX}${userId}`);
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  // Opportunity, analysis, and search context from this browser session belong to the signed-out user.
  Object.keys(window.sessionStorage)
    .filter((key) => key.startsWith("hulum."))
    .forEach((key) => window.sessionStorage.removeItem(key));
}

export function isSignedIn(): boolean {
  return getSessionToken() !== null && getUserId() !== null;
}

export function getLanguage(): LanguageCode {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANGUAGE_KEY);
  return isLanguageCode(stored) ? stored : "en";
}

export const LANGUAGE_CHANGE_EVENT = "hulum-language-change";

export function setLanguage(language: LanguageCode): void {
  window.localStorage.setItem(LANGUAGE_KEY, language);
  window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
}
