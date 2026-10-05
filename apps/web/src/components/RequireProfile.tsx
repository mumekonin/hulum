"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ProfileView } from "@hulum/shared";
import { api, isNotFound } from "@/lib/api";
import { needsOnboarding } from "@/lib/post-auth";
import { getUserId } from "@/lib/storage";

const SiteProfileContext = createContext<ProfileView | null>(null);

export function useSiteProfile(): ProfileView | null {
  return useContext(SiteProfileContext);
}

/**
 * Site pages need a saved field of study before Analyze can judge fit.
 * /profile stays open so the user can finish facts without being trapped.
 * The loaded view is shared so Discover does not fetch the profile a second time.
 */
export function RequireProfile({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<ProfileView | null>(null);

  useEffect(() => {
    let cancelled = false;
    const userId = getUserId();
    if (userId === null) {
      router.replace("/sign-in");
      return;
    }
    if (pathname === "/profile") {
      setReady(true);
      return;
    }

    setReady(false);
    void api<ProfileView>(`/api/profile/${userId}`)
      .then((loaded) => {
        if (cancelled) return;
        if (needsOnboarding(loaded)) {
          router.replace("/onboarding");
          return;
        }
        setView(loaded);
        setReady(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (isNotFound(error)) {
          router.replace("/onboarding");
          return;
        }
        setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <p className="text-muted" role="status">
        Checking profile…
      </p>
    );
  }
  return <SiteProfileContext.Provider value={view}>{children}</SiteProfileContext.Provider>;
}
