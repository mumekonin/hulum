"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthSession } from "@hulum/shared";
import { api, userFacingError } from "@/lib/api";
import { routeAfterAuth } from "@/lib/post-auth";
import { persistAuthSession, setSessionToken } from "@/lib/storage";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finishing Google sign-in…");

  useEffect(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    const token =
      new URLSearchParams(hash).get("token") ?? new URLSearchParams(window.location.search).get("token");
    if (token === null || token.trim() === "") {
      router.replace("/?auth_error=google_failed");
      return;
    }
    setSessionToken(token);
    void api<AuthSession>("/api/auth/me")
      .then((session) => {
        persistAuthSession(session);
        return routeAfterAuth(router);
      })
      .catch((error: unknown) => {
        setMessage(userFacingError(error));
        router.replace("/?auth_error=google_failed");
      });
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <p className="text-[13px] text-gw-secondary">{message}</p>
    </main>
  );
}
