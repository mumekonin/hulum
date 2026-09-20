import { Router } from "express";
import { profileInputSchema, profilePatchSchema, type Profile, type User } from "@hulum/shared";
import { demoProfileInput } from "../data/seedOpportunities.js";
import { fail, ok } from "../lib/http.js";
import { createId, nowIso } from "../lib/id.js";
import { mutateStore } from "../store/fileStore.js";

export const profileRouter = Router();

profileRouter.post("/", async (req, res) => {
  const parsed = profileInputSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, "Profile is incomplete or invalid.", 422, "INVALID_PROFILE");
    return;
  }

  const input = parsed.data;
  const timestamp = nowIso();
  const userId = input.userId ?? createId("user");

  const profile = await mutateStore((store) => {
    let user = store.users.find((item) => item.id === userId);
    if (!user) {
      user = {
        id: userId,
        name: input.name,
        preferredLanguage: input.preferredLanguage,
        createdAt: timestamp,
        updatedAt: timestamp,
      } satisfies User;
      store.users.push(user);
    } else {
      user.name = input.name;
      user.preferredLanguage = input.preferredLanguage;
      user.updatedAt = timestamp;
    }

    const existing = store.profiles.find((item) => item.userId === userId);
    const next: Profile = {
      id: existing?.id ?? createId("profile"),
      userId,
      name: input.name,
      educationLevel: input.educationLevel,
      fieldOfStudy: input.fieldOfStudy,
      graduationYear: input.graduationYear,
      country: input.country,
      city: input.city,
      languages: input.languages,
      skills: input.skills,
      experience: input.experience,
      yearsExperience: input.yearsExperience,
      interests: input.interests,
      documentsHeld: input.documentsHeld,
      preferredLanguage: input.preferredLanguage,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    if (existing) {
      Object.assign(existing, next);
      return existing;
    }
    store.profiles.push(next);
    return next;
  });

  ok(res, profile, 201);
});

profileRouter.post("/demo", async (_req, res) => {
  const timestamp = nowIso();
  const userId = "user_demo_abeba";
  const profile = await mutateStore((store) => {
    const user: User = {
      id: userId,
      name: demoProfileInput.name,
      preferredLanguage: demoProfileInput.preferredLanguage,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const existingUser = store.users.find((item) => item.id === userId);
    if (existingUser) Object.assign(existingUser, user);
    else store.users.push(user);

    const next: Profile = {
      id: "profile_demo_abeba",
      userId,
      ...demoProfileInput,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const existing = store.profiles.find((item) => item.userId === userId);
    if (existing) Object.assign(existing, next);
    else store.profiles.push(next);
    return next;
  });
  ok(res, profile, 201);
});

profileRouter.get("/:userId", async (req, res) => {
  const store = await mutateStore((current) => current);
  const profile = store.profiles.find((item) => item.userId === req.params.userId);
  if (!profile) {
    fail(res, "No profile found for this user.", 404, "PROFILE_NOT_FOUND");
    return;
  }
  ok(res, profile);
});

profileRouter.patch("/:userId", async (req, res) => {
  const parsed = profilePatchSchema.safeParse(req.body);
  if (!parsed.success) {
    fail(res, "Invalid profile update.", 422, "INVALID_PROFILE");
    return;
  }

  const profile = await mutateStore((store) => {
    const existing = store.profiles.find((item) => item.userId === req.params.userId);
    if (!existing) return null;
    Object.assign(existing, parsed.data, { updatedAt: nowIso() });
    return existing;
  });

  if (!profile) {
    fail(res, "No profile found for this user.", 404, "PROFILE_NOT_FOUND");
    return;
  }
  ok(res, profile);
});
