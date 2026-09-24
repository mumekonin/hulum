import { profileCompleteness, type Profile, type ProfileView, type PatchProfileRequest, type ProfileWrite } from "@hulum/shared";
import { loadEnv } from "../config/env.js";
import { maybeIssueSessionToken } from "../security/session.js";
import type { ProfileStore } from "./store.js";

export type ProfileService = {
  create(input: { name: string; email: string; userId?: string } & ProfileWrite): Promise<ProfileView>;
  getByUserId(userId: string): Promise<ProfileView | undefined>;
  getByEmail(email: string): Promise<ProfileView | undefined>;
  ensureDemo(): Promise<ProfileView>;
  update(userId: string, patch: PatchProfileRequest): Promise<ProfileView | undefined>;
};

function toView(stored: { name: string; email: string; profile: Profile }): ProfileView {
  const token = maybeIssueSessionToken(stored.profile.userId, loadEnv({ fromFile: false }));
  return {
    name: stored.name,
    email: stored.email,
    profile: stored.profile,
    completeness: profileCompleteness(stored.profile),
    ...(token === undefined ? {} : { sessionToken: token }),
  };
}

const DEMO_EMAIL = "abeba.tesfaye@example.invalid";

export function createProfileService(store: ProfileStore): ProfileService {
  return {
    async create(input: { name: string; email: string; userId?: string } & ProfileWrite): Promise<ProfileView> {
      return toView(await store.create(input));
    },
    async getByUserId(userId: string): Promise<ProfileView | undefined> {
      const stored = await store.getByUserId(userId);
      return stored === undefined ? undefined : toView(stored);
    },
    async getByEmail(email: string): Promise<ProfileView | undefined> {
      const stored = await store.getByEmail(email);
      return stored === undefined ? undefined : toView(stored);
    },
    async ensureDemo(): Promise<ProfileView> {
      const existing = await store.getByEmail(DEMO_EMAIL);
      if (existing !== undefined) {
        return toView(existing);
      }
      const { demoProfileInput } = await import("../data/seedOpportunities.js");
      return toView(
        await store.create({
          name: demoProfileInput.name,
          email: DEMO_EMAIL,
          educationLevel: demoProfileInput.educationLevel,
          fieldOfStudy: demoProfileInput.fieldOfStudy,
          graduationYear: demoProfileInput.graduationYear,
          country: demoProfileInput.country,
          city: demoProfileInput.city,
          languages: [...demoProfileInput.languages],
          skills: [...demoProfileInput.skills],
          experience: demoProfileInput.experience,
          interests: [...demoProfileInput.interests],
        }),
      );
    },
    async update(userId: string, patch: PatchProfileRequest): Promise<ProfileView | undefined> {
      const stored = await store.update(userId, patch);
      return stored === undefined ? undefined : toView(stored);
    },
  };
}
