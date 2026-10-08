"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isSignedIn } from "@/lib/storage";
import { hasVoxidePublicKey } from "@/lib/voxide";

const VoxideAskHulum = dynamic(
  () => import("@/components/VoxideAskHulum").then((mod) => mod.VoxideAskHulum),
  { ssr: false },
);

const PUBLIC_PREFIXES = ["/sign-in", "/verify", "/forgot-password", "/reset-password", "/privacy", "/terms", "/auth"];

/** Welcome, sign-in, and legal pages stay free of the microphone, even if this browser still has a session. */
function isPublicPage(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** One floating Ask HULUM popup, on every page after sign-in. */
export function SiteVoice() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(hasVoxidePublicKey() && isSignedIn() && !isPublicPage(pathname));
  }, [pathname]);

  if (!show) {
    return null;
  }
  return <VoxideAskHulum />;
}
