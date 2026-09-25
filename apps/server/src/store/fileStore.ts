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
import { testOpportunities } from "../data/test-opportunities.js";

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

let memory: StoreShape | null = null;

function getStorePath() {
  return path.resolve(process.env.STORE_PATH ?? "./data/store.json");
}

function emptyStore(): StoreShape {
  return {
    users: [],
    profiles: [],
    opportunities: process.env.NODE_ENV === "test" ? [...testOpportunities] : [],
    analyses: [],
    requirementResults: [],
    readinessItems: [],
    voiceSessions: [],
  };
}

export async function loadStore(): Promise<StoreShape> {
  if (memory) return memory;
  try {
    const raw = await readFile(getStorePath(), "utf8");
    const parsed = JSON.parse(raw) as StoreShape;
    parsed.opportunities = Array.isArray(parsed.opportunities) ? parsed.opportunities : [];
    if (process.env.NODE_ENV === "test" && parsed.opportunities.length === 0) {
      parsed.opportunities = [...testOpportunities];
    }
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
  const filePath = getStorePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(memory, null, 2), "utf8");
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
