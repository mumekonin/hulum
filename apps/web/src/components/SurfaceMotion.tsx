"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, type PointerEvent, type ReactNode } from "react";

export type SurfaceVariant = "apply" | "maybe" | "skip" | "primary" | "secondary";

type SurfaceMotionProps = {
  variant: SurfaceVariant;
  children: ReactNode;
  className?: string;
  href?: string;
  role?: string;
};

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SurfaceMotion({
  variant,
  children,
  className = "",
  href,
  role,
}: SurfaceMotionProps) {
  const pending = useRef<{ x: string; y: string } | null>(null);
  const frame = useRef(0);

  useEffect(() => {
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch" || reducedMotion()) return;
    const node = event.currentTarget;
    const rect = node.getBoundingClientRect();
    pending.current = {
      x: `${event.clientX - rect.left}px`,
      y: `${event.clientY - rect.top}px`,
    };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const next = pending.current;
      if (!next) return;
      node.style.setProperty("--mouse-x", next.x);
      node.style.setProperty("--mouse-y", next.y);
    });
  }, []);

  const onPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const node = event.currentTarget;
    if (!reducedMotion()) {
      node.classList.add("is-pressed");
      const fx = node.querySelector("[data-surface-fx]");
      if (fx) {
        const rect = node.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.className = "hulum-surface__ripple";
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        fx.appendChild(ripple);
        const clear = () => ripple.remove();
        ripple.addEventListener("animationend", clear, { once: true });
        window.setTimeout(clear, 450);
      }
    }
  }, []);

  const onPointerEnd = useCallback((event: PointerEvent<HTMLElement>) => {
    event.currentTarget.classList.remove("is-pressed");
  }, []);

  const classes = `hulum-surface hulum-surface--${variant} ${className}`;
  const inner = (
    <>
      <span className="hulum-surface__fx" data-surface-fx aria-hidden>
        <span className="hulum-surface__glow" />
        <span className="hulum-surface__wash" />
      </span>
      <div className="hulum-surface__body">{children}</div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onPointerLeave={onPointerEnd}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div
      className={classes}
      role={role}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onPointerLeave={onPointerEnd}
    >
      {inner}
    </div>
  );
}
