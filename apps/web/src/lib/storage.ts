const USER_KEY = "hulum.userId";

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(USER_KEY);
}

export function setUserId(userId: string): void {
  window.localStorage.setItem(USER_KEY, userId);
}

export function requireUserId(): string {
  const existing = getUserId();
  if (existing) return existing;
  const userId = crypto.randomUUID();
  setUserId(userId);
  return userId;
}
