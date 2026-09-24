import { profileCompleteness, type Profile, type ProfileView, type PatchProfileRequest, type ProfileWrite } from "@hulum/shared";
import { loadEnv } from "../config/env.js";
import { maybeIssueSessionToken } from "../security/session.js";
import type { ProfileStore } from "./store.js";

export type ProfileService = {
  create(input: { name: string; email: string; userId?: string } & ProfileWrite): Promise<ProfileView>;
  getByUserId(userId: string): Promise<ProfileView | undefined>;
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

export function createProfileService(store: ProfileStore): ProfileService {
  return {
    async create(input: { name: string; email: string; userId?: string } & ProfileWrite): Promise<ProfileView> {
      return toView(await store.create(input));
    },
    async getByUserId(userId: string): Promise<ProfileView | undefined> {
      const stored = await store.getByUserId(userId);
      return stored === undefined ? undefined : toView(stored);
    },
    async update(userId: string, patch: PatchProfileRequest): Promise<ProfileView | undefined> {
      const stored = await store.update(userId, patch);
      return stored === undefined ? undefined : toView(stored);
    },
  };
}
