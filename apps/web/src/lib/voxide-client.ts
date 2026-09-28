"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { VoxideClient, VoxideStatus } from "@voxide/react";

/**
 * The one site-wide Voxide client, shared so Ask HULUM can start and stop the same
 * browser voice session as the floating widget. Speech never goes through the HULUM API.
 */
let current: VoxideClient | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function publishVoxideClient(client: VoxideClient | null): void {
  current = client;
  listeners.forEach((listener) => listener());
}

export function useVoxideClient(): VoxideClient | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}

export function useVoxideStatus(client: VoxideClient | null): {
  status: VoxideStatus;
  errorCode?: string;
} {
  const subscribeClient = useCallback(
    (onChange: () => void) => (client ? client.subscribe(onChange) : () => {}),
    [client],
  );
  const snapshot = useSyncExternalStore(
    subscribeClient,
    () => client?.getSnapshot() ?? null,
    () => null,
  );
  return {
    status: snapshot?.status ?? "idle",
    ...(snapshot?.errorCode ? { errorCode: snapshot.errorCode } : {}),
  };
}
