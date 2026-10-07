"use client";

import type { PointerEvent } from "react";
import type { Decision } from "@hulum/shared";

const styles: Record<Decision, string> = {
  APPLY: "border-apply/40 bg-apply-soft text-apply",
  MAYBE: "border-maybe/40 bg-maybe-soft text-maybe decision-touch decision-touch--maybe",
  SKIP: "border-skip/40 bg-skip-soft text-skip decision-touch decision-touch--skip",
};

const meanings: Record<Decision, string> = {
  APPLY: "Key known requirements are met.",
  MAYBE: "Something important is uncertain or needs verification.",
  SKIP: "A critical requirement is not met.",
};

const pendingFrame = new WeakMap<HTMLElement, number>();

/** Moves the hover light by writing CSS variables on the element; no React state, no re-render. */
function followPointer(event: PointerEvent<HTMLSpanElement>) {
  if (event.pointerType !== "mouse") return;
  const el = event.currentTarget;
  const { clientX, clientY } = event;
  if (pendingFrame.has(el)) return;
  pendingFrame.set(
    el,
    requestAnimationFrame(() => {
      pendingFrame.delete(el);
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--touch-x", `${clientX - rect.left}px`);
      el.style.setProperty("--touch-y", `${clientY - rect.top}px`);
    }),
  );
}

export function DecisionBadge({ decision, size = "md" }: { decision: Decision; size?: "sm" | "md" | "lg" }) {
  const sizing =
    size === "lg" ? "px-5 py-2 text-3xl md:text-4xl" : size === "sm" ? "px-2 py-0.5 text-xs tracking-[0.12em]" : "px-3 py-1 text-lg";
  const tracksPointer = decision !== "APPLY";
  return (
    <span
      className={`inline-flex border font-display tracking-wide ${sizing} ${styles[decision]}`}
      aria-label={`Decision ${decision}. ${meanings[decision]}`}
      onPointerEnter={tracksPointer ? followPointer : undefined}
      onPointerMove={tracksPointer ? followPointer : undefined}
    >
      {decision}
    </span>
  );
}
