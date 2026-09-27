"use client";

import { useEffect, useState } from "react";
import type { AuthSession } from "@hulum/shared";
import { api } from "./api";
import { isSignedIn } from "./storage";

export type Account = Pick<AuthSession, "name" | "email">;

export function useAccount(): Account | null {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    if (!isSignedIn()) return;
    let cancelled = false;
    void api<AuthSession>("/api/auth/me")
      .then((me) => {
        if (!cancelled) setAccount({ name: me.name, email: me.email });
      })
      .catch(() => {
        if (!cancelled) setAccount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return account;
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}
