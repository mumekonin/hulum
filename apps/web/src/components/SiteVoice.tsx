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

/** One floating Ask HULUM popup, on every page after sign-in. */
export function SiteVoice() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(hasVoxidePublicKey() && isSignedIn());
  }, [pathname]);

  if (!show) {
    return null;
  }
  return <VoxideAskHulum />;
}
