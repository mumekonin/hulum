import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  Analysis,
  Opportunity,
  Profile,
  ReadinessItem,
  RequirementResult,
  User,
} from "@hulum/shared";
import { seedOpportunities } from "../data/seedOpportunities.js";

export type StoreShape = {
  users: User[];
  profiles: Profile[];
  opportunities: Opportunity[];
  analyses: Analysis[];
  requirementResults: RequirementResult[];
  readinessItems: ReadinessItem[];
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
  };
}

export async function loadStore(): Promise<StoreShape> {
  if (memory) return memory;
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as StoreShape;
    parsed.opportunities = seedOpportunities;
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
