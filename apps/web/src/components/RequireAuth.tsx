"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSignedIn } from "@/lib/storage";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSignedIn()) {
      router.replace("/sign-in");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <p className="text-muted" role="status">
        Checking sign-in…
      </p>
    );
  }
  return <>{children}</>;
}
