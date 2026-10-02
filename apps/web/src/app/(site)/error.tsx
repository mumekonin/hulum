"use client";

import { RouteError } from "@/components/RouteError";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} />;
}
