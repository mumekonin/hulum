import type { ProfileView } from "@hulum/shared";
import { api, isNotFound } from "./api";
import { getUserId } from "./storage";

/**
 * Registration stores a placeholder profile row, so "new" means the user never saved a
 * field of study (the first fact onboarding asks for), or the profile is missing entirely.
 */
export function needsOnboarding(view: ProfileView): boolean {
  return view.completeness.missing.includes("fieldOfStudy");
}

export async function destinationAfterAuth(userId: string): Promise<string> {
  try {
    const view = await api<ProfileView>(`/api/profile/${userId}`);
    return needsOnboarding(view) ? "/onboarding" : "/opportunities";
  } catch (err) {
    return isNotFound(err) ? "/onboarding" : "/opportunities";
  }
}

export async function routeAfterAuth(router: { replace: (href: string) => void }): Promise<void> {
  const userId = getUserId();
  router.replace(userId === null ? "/" : await destinationAfterAuth(userId));
}
