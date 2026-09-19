import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  Analysis,
  LanguageCode,
  Opportunity,
  Profile,
  ReadinessItem,
  RequirementResult,
  User,
} from "@hulum/shared";
import { seedOpportunities } from "../data/seedOpportunities.js";

export type VoiceSessionRecord = {
  id: string;
  userId: string;
  language: LanguageCode;
  startedAt: string;
  endedAt: string | null;
};

export type StoreShape = {
  users: User[];
  profiles: Profile[];
  opportunities: Opportunity[];
  analyses: Analysis[];
  requirementResults: RequirementResult[];
  readinessItems: ReadinessItem[];
  voiceSessions: VoiceSessionRecord[];
};

const storePath = path.resolve(process.env.STORE_PATH ?? "./data/store.json");

let memory: StoreShape | null = null;

function emptyStore(): StoreShape {
  return {
    users: [],
    profiles: [],
    opportunities: [...seedOpportunities],
    analyses: [],
    requirementResults: [],
    readinessItems: [],
    voiceSessions: [],
  };
}

export async function loadStore(): Promise<StoreShape> {
  if (memory) return memory;
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as StoreShape;
    parsed.opportunities = seedOpportunities;
    parsed.voiceSessions = Array.isArray(parsed.voiceSessions) ? parsed.voiceSessions : [];
    memory = parsed;
  } catch {
    memory = emptyStore();
    await persistStore();
  }
  return memory;
}

export async function persistStore(): Promise<void> {
  if (!memory) return;
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(memory, null, 2), "utf8");
}

export async function mutateStore<T>(mutator: (store: StoreShape) => T | Promise<T>): Promise<T> {
  const store = await loadStore();
  const result = await mutator(store);
  await persistStore();
  return result;
}

/** Test-only: drop the in-memory store so STORE_PATH can be swapped. */
export function resetStoreForTests(): void {
  memory = null;
}
