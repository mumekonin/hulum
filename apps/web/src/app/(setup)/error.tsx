"use client";

import { RouteError } from "@/components/RouteError";

export default function SetupError({ reset }: { error: Error; reset: () => void }) {
  return <RouteError reset={reset} home={{ label: "Open your profile", href: "/profile" }} />;
}
