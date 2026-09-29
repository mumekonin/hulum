"use client";

import { useEffect, useRef } from "react";
import { StatusPanel } from "./StatusPanel";

/** Shared body for route error boundaries: says what happened and offers a retry. */
export function RouteError({
  reset,
  home = { label: "Go to Discover", href: "/opportunities" },
}: {
  reset: () => void;
  home?: { label: string; href: string };
}) {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, []);

  return (
    <section className="max-w-2xl">
      <h1 ref={heading} tabIndex={-1} className="font-display text-4xl outline-none">
        Something went wrong
      </h1>
      <StatusPanel
        variant="error"
        title="This page couldn't load"
        primary={{ label: "Try again", onClick: reset }}
        secondary={home}
      >
        Your saved profile and analyses are not affected. If this keeps happening, reload the page
        or check your connection.
      </StatusPanel>
    </section>
  );
}
