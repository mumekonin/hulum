"use client";

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";

const SOURCES = [70, 140, 210, 280, 350] as const;
/** Matches the static diagram's filled dot, then walks left, then the far right. */
const SOURCE_ORDER = [3, 2, 1, 0, 4] as const;

const FIT = { x: 210, y: 198 };
const READY = { x: 210, y: 290 };
const DECISION = { x: 210, y: 400 };

const SOURCE_MS = 620;
const GLIDE_MS = 860;
const STAGE_MS = 520;
const BEAT_MS = 300;
const DECISION_MS = 720;
const REST_MS = 1000;

type HoverNode = "fit" | "ready" | "decision" | "";

function sourcePath(x: number): string {
  return `M ${x} 99 C ${x} 150, 210 140, 210 188`;
}

export function DecisionPath() {
  const svgRef = useRef<SVGSVGElement>(null);
  const motionRef = useRef<SVGAnimateMotionElement>(null);
  const particleRef = useRef<SVGCircleElement>(null);
  const hoverRef = useRef<HoverNode>("");

  useEffect(() => {
    const svg = svgRef.current;
    const motion = motionRef.current;
    const particle = particleRef.current;
    if (!svg || !motion || !particle) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    let stopped = false;
    const pending = new Set<number>();

    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(() => {
          pending.delete(id);
          resolve();
        }, ms);
        pending.add(id);
      });

    const waitIfHovered = async () => {
      while (!stopped && hoverRef.current !== "") {
        await delay(90);
      }
    };

    const glide = (d: string) => {
      try {
        motion.endElement();
      } catch {
        /* not running yet */
      }
      particle.setAttribute("opacity", "1");
      motion.setAttribute("dur", `${GLIDE_MS}ms`);
      motion.setAttribute("path", d);
      try {
        motion.beginElement();
      } catch {
        particle.setAttribute("opacity", "0");
      }
    };

    const hideParticle = () => particle.setAttribute("opacity", "0");

    const onEnd = () => hideParticle();
    motion.addEventListener("endEvent", onEnd);

    const run = async () => {
      let step = 0;
      while (!stopped) {
        const index = SOURCE_ORDER[step % SOURCE_ORDER.length] ?? 3;
        const x = SOURCES[index] ?? 280;

        await waitIfHovered();
        if (stopped) return;
        svg.setAttribute("data-flow", "");
        svg.setAttribute("data-node", "");
        svg.setAttribute("data-source", String(index));
        await delay(SOURCE_MS);

        await waitIfHovered();
        if (stopped) return;
        svg.setAttribute("data-flow", "src");
        glide(sourcePath(x));
        await delay(GLIDE_MS);
        hideParticle();

        await waitIfHovered();
        if (stopped) return;
        svg.setAttribute("data-flow", "");
        svg.setAttribute("data-node", "fit");
        await delay(STAGE_MS);

        await waitIfHovered();
        if (stopped) return;
        svg.setAttribute("data-node", "");
        await delay(BEAT_MS);

        await waitIfHovered();
        if (stopped) return;
        svg.setAttribute("data-flow", "ready");
        glide("M 210 210 V 278");
        await delay(GLIDE_MS);
        hideParticle();

        await waitIfHovered();
        if (stopped) return;
        svg.setAttribute("data-flow", "");
        svg.setAttribute("data-node", "ready");
        await delay(STAGE_MS);

        await waitIfHovered();
        if (stopped) return;
        svg.setAttribute("data-node", "");
        await delay(BEAT_MS);

        await waitIfHovered();
        if (stopped) return;
        svg.setAttribute("data-flow", "decision");
        glide("M 210 302 V 378");
        await delay(GLIDE_MS);
        hideParticle();

        await waitIfHovered();
        if (stopped) return;
        svg.setAttribute("data-flow", "");
        svg.setAttribute("data-node", "decision");
        await delay(DECISION_MS);

        await waitIfHovered();
        if (stopped) return;
        svg.setAttribute("data-node", "");
        await delay(REST_MS);
        step += 1;
      }
    };

    void run();

    const onMotionChange = () => {
      if (media.matches) {
        stopped = true;
        hideParticle();
        svg.setAttribute("data-flow", "");
        svg.setAttribute("data-node", "");
        svg.setAttribute("data-source", "3");
      }
    };
    media.addEventListener("change", onMotionChange);

    return () => {
      stopped = true;
      media.removeEventListener("change", onMotionChange);
      motion.removeEventListener("endEvent", onEnd);
      for (const id of pending) window.clearTimeout(id);
      hideParticle();
    };
  }, []);

  const setHover = (node: HoverNode) => {
    hoverRef.current = node;
    svgRef.current?.setAttribute("data-hover", node);
  };

  const trackLight = (event: ReactPointerEvent<SVGGElement>, id: string, origin: { x: number; y: number }) => {
    if (event.pointerType !== "mouse") return;
    const svg = svgRef.current;
    const grad = document.getElementById(id);
    if (!svg || !grad) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return;
    const local = point.matrixTransform(matrix.inverse());
    const cx = 50 + ((local.x - origin.x) / 28) * 32;
    const cy = 50 + ((local.y - origin.y) / 28) * 32;
    grad.setAttribute("cx", `${Math.min(88, Math.max(12, cx))}%`);
    grad.setAttribute("cy", `${Math.min(88, Math.max(12, cy))}%`);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 420 500"
      data-source="3"
      data-flow=""
      data-node=""
      data-hover=""
      className="wl-journey h-auto w-full max-w-[280px] overflow-visible sm:max-w-[320px] lg:max-w-[400px]"
      role="group"
      aria-label="Many opportunities lead to fit, then readiness, then one decision: apply, maybe, or skip."
    >
      <defs>
        <radialGradient id="wl-journey-fit-light" cx="50%" cy="50%" r="58%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="var(--wl-ink)" stopOpacity="0.14" />
          <stop offset="72%" stopColor="var(--wl-ink)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wl-journey-ready-light" cx="50%" cy="50%" r="58%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="var(--wl-ink)" stopOpacity="0.14" />
          <stop offset="72%" stopColor="var(--wl-ink)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wl-journey-decision-light" cx="50%" cy="50%" r="62%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="var(--wl-accent)" stopOpacity="0.28" />
          <stop offset="70%" stopColor="var(--wl-accent)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="wl-journey__halos stroke-wl-line" fill="none" strokeWidth="1">
        <circle cx="210" cy="400" r="70" />
        <circle cx="210" cy="400" r="120" strokeDasharray="2 5" />
        <circle cx="210" cy="400" r="175" opacity="0.6" />
      </g>

      <text
        x="210"
        y="52"
        textAnchor="middle"
        className="fill-wl-muted font-gw-mono text-[11px] tracking-[0.22em]"
      >
        OPPORTUNITIES
      </text>

      {SOURCES.map((x, index) => (
        <path
          key={`path-${x}`}
          data-i={index}
          d={sourcePath(x)}
          fill="none"
          strokeWidth="1"
          className="wl-journey__src stroke-wl-line"
        />
      ))}

      <path d="M210 210 V 278" className="wl-journey__stem wl-journey__stem--a stroke-wl-ink" strokeWidth="1.25" />
      <path d="M210 302 V 378" className="wl-journey__stem wl-journey__stem--b stroke-wl-ink" strokeWidth="1.25" />

      {SOURCES.map((x, index) => (
        <g key={`node-${x}`} data-i={index} className="wl-journey__opp" transform={`translate(${x} 92)`}>
          <g className="wl-journey__opp-scale">
            <circle r="12" className="wl-journey__opp-ring fill-none stroke-wl-ink" strokeWidth="1" />
            <circle r="7" strokeWidth="1.25" className="wl-journey__opp-dot fill-wl-soft stroke-wl-muted" />
          </g>
        </g>
      ))}

      <circle ref={particleRef} r="2.15" opacity="0" className="wl-journey__particle fill-wl-ink">
        <animateMotion ref={motionRef} begin="indefinite" fill="freeze" dur="860ms" path="" />
      </circle>

      <Stage
        kind="fit"
        y={FIT.y}
        step="02"
        label="FIT"
        lightId="wl-journey-fit-light"
        onEnter={() => setHover("fit")}
        onLeave={() => setHover("")}
        onMove={(event) => trackLight(event, "wl-journey-fit-light", FIT)}
      />
      <Stage
        kind="ready"
        y={READY.y}
        step="03"
        label="READINESS"
        lightId="wl-journey-ready-light"
        onEnter={() => setHover("ready")}
        onLeave={() => setHover("")}
        onMove={(event) => trackLight(event, "wl-journey-ready-light", READY)}
      />

      <g
        className="wl-journey__node wl-journey__node--decision"
        tabIndex={0}
        role="group"
        aria-label="DECISION, step 04. Apply, maybe, or skip."
        onPointerEnter={() => setHover("decision")}
        onPointerLeave={() => setHover("")}
        onFocus={() => setHover("decision")}
        onBlur={() => setHover("")}
        onPointerMove={(event) => trackLight(event, "wl-journey-decision-light", DECISION)}
      >
        <circle cx="210" cy="400" r="28" className="wl-journey__hit" fill="transparent" />
        <circle cx="210" cy="400" r="22" className="wl-journey__light wl-journey__light--decision" fill="url(#wl-journey-decision-light)" />
        <circle cx="210" cy="400" r="22" className="wl-journey__pulse wl-journey__pulse--decision fill-none stroke-wl-accent" strokeWidth="1" />
        <circle cx="210" cy="400" r="22" className="wl-journey__decision-ring fill-none stroke-wl-accent" strokeWidth="1" />
        <circle cx="210" cy="400" r="10" className="wl-journey__decision-core fill-wl-accent" />
        <text x="246" y="396" className="wl-journey__label fill-wl-ink font-gw-mono text-[11px] tracking-[0.2em]">
          DECISION
        </text>
        <text x="246" y="412" className="wl-journey__step fill-wl-muted font-gw-mono text-[10px] tracking-[0.12em]">
          04
        </text>
      </g>

      <text
        x="210"
        y="466"
        textAnchor="middle"
        className="fill-wl-ink font-gw-serif text-[19px] italic"
      >
        Apply · Maybe · Skip
      </text>
    </svg>
  );
}

function Stage({
  kind,
  y,
  step,
  label,
  lightId,
  onEnter,
  onLeave,
  onMove,
}: {
  kind: "fit" | "ready";
  y: number;
  step: string;
  label: string;
  lightId: string;
  onEnter: () => void;
  onLeave: () => void;
  onMove: (event: ReactPointerEvent<SVGGElement>) => void;
}) {
  return (
    <g
      className={`wl-journey__node wl-journey__node--${kind}`}
      tabIndex={0}
      role="group"
      aria-label={`${label}, step ${step}`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onPointerMove={onMove}
    >
      <circle cx="210" cy={y} r="26" className="wl-journey__hit" fill="transparent" />
      <circle cx="210" cy={y} r="16" className="wl-journey__light" fill={`url(#${lightId})`} />
      <circle
        cx="210"
        cy={y}
        r="11"
        className={`wl-journey__pulse wl-journey__pulse--${kind} fill-none stroke-wl-ink`}
        strokeWidth="1"
      />
      <circle cx="210" cy={y} r="11" className="wl-journey__ring fill-wl-surface stroke-wl-ink" strokeWidth="1.25" />
      <circle cx="210" cy={y} r="3" className="wl-journey__core fill-wl-ink" />
      <text x="236" y={y - 2} className="wl-journey__label fill-wl-ink font-gw-mono text-[11px] tracking-[0.2em]">
        {label}
      </text>
      <text x="236" y={y + 14} className="wl-journey__step fill-wl-muted font-gw-mono text-[10px] tracking-[0.12em]">
        {step}
      </text>
    </g>
  );
}
