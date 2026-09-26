"use client";

import dynamic from "next/dynamic";
import { hasVoxidePublicKey } from "@/lib/voxide";

const VoxideAskHulum = dynamic(
  () => import("@/components/VoxideAskHulum").then((mod) => mod.VoxideAskHulum),
  { ssr: false },
);

/** One Voxide widget for every page after login. */
export function SiteVoice() {
  if (!hasVoxidePublicKey()) {
    return null;
  }
  return <VoxideAskHulum />;
}
