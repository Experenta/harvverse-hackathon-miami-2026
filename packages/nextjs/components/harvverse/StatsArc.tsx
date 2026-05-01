import type { ReactNode } from "react";

type StatItem = {
  label: string;
  value: ReactNode;
  tone?: "default" | "mint" | "muted" | "cyan";
};

const TONE_CLASSES: Record<NonNullable<StatItem["tone"]>, string> = {
  default: "text-harv-text",
  mint: "text-[color:var(--color-harv-mint)]",
  muted: "text-muted-harv",
  cyan: "text-[color:var(--color-harv-cyan)]",
};

// ── Layout constants (1 SVG unit ≈ 1 CSS px; VB_H == CONTAINER_H) ──────────
const VB_W = 1000;
const VB_H = 220;
const CONTAINER_H = VB_H; // px

const EDGE_Y = 108; // arc touches here at both edges
const PEAK_Y = 18; // arc crown (center)
// Quadratic bezier control point: CP_Y = 2·PEAK_Y − EDGE_Y guarantees peak == PEAK_Y at t = 0.5
const CP_Y = 2 * PEAK_Y - EDGE_Y; // = −72

const ITEMS_Y = 128; // px from top — where the label row starts

/** Quadratic bezier: arc(t) → {x, y} in SVG/screen coordinates */
const bezier = (t: number) => {
  const mt = 1 - t;
  return {
    x: mt * mt * 0 + 2 * mt * t * (VB_W / 2) + t * t * VB_W,
    y: mt * mt * EDGE_Y + 2 * mt * t * CP_Y + t * t * EDGE_Y,
  };
};

type StatsArcProps = { items: StatItem[] };

/**
 * Stats displayed inside a sweeping arch.
 * Each stat connects to the arc with a thin vertical line;
 * the arch gradient fades softly toward both edges.
 */
export const StatsArc = ({ items }: StatsArcProps) => {
  const n = items.length;
  const arcPath = `M 0 ${EDGE_Y} Q ${VB_W / 2} ${CP_Y} ${VB_W} ${EDGE_Y}`;

  return (
    <div className="relative mt-12 w-full" style={{ height: CONTAINER_H }}>
      {/* ── SVG arch ────────────────────────────────────────────────── */}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          {/* Edge-fade mask — very gradual fade so ends blur naturally */}
          <linearGradient id="sarc-mask-g" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="4%" stopColor="white" stopOpacity="0.2" />
            <stop offset="10%" stopColor="white" stopOpacity="0.7" />
            <stop offset="18%" stopColor="white" stopOpacity="1" />
            <stop offset="82%" stopColor="white" stopOpacity="1" />
            <stop offset="90%" stopColor="white" stopOpacity="0.7" />
            <stop offset="96%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="sarc-fade">
            <rect x="0" y="-300" width={VB_W} height={VB_H + 600} fill="url(#sarc-mask-g)" />
          </mask>

          {/* Stroke gradient — soft mint, brightest at center */}
          <linearGradient id="sarc-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-harv-mint)" stopOpacity="0" />
            <stop offset="8%" stopColor="var(--color-harv-mint)" stopOpacity="0.3" />
            <stop offset="22%" stopColor="var(--color-harv-mint)" stopOpacity="0.75" />
            <stop offset="50%" stopColor="var(--color-harv-mint)" stopOpacity="1" />
            <stop offset="78%" stopColor="var(--color-harv-mint)" stopOpacity="0.75" />
            <stop offset="92%" stopColor="var(--color-harv-mint)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-harv-mint)" stopOpacity="0" />
          </linearGradient>

          {/* Filled area gradient */}
          <linearGradient id="sarc-fill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-harv-mint)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-harv-mint)" stopOpacity="0.045" />
            <stop offset="100%" stopColor="var(--color-harv-mint)" stopOpacity="0" />
          </linearGradient>

          {/* Glow around stroke + dots */}
          <filter id="sarc-glow" x="-8%" y="-300%" width="116%" height="700%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Wide soft blur for edge ghosting */}
          <filter id="sarc-edge" x="-5%" y="-200%" width="110%" height="500%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* Filled arch interior */}
        <path d={`${arcPath} L ${VB_W} ${VB_H} L 0 ${VB_H} Z`} fill="url(#sarc-fill)" mask="url(#sarc-fade)" />

        {/* Ghost blurred copy — creates the dissolving-edge effect */}
        <path
          d={arcPath}
          fill="none"
          stroke="var(--color-harv-mint)"
          strokeWidth="22"
          strokeOpacity="0.07"
          filter="url(#sarc-edge)"
          mask="url(#sarc-fade)"
        />

        {/* Primary glowing stroke */}
        <path
          d={arcPath}
          fill="none"
          stroke="url(#sarc-stroke)"
          strokeWidth="1.8"
          filter="url(#sarc-glow)"
          mask="url(#sarc-fade)"
        />

        {/* Dot + ring at each item's position on the arc */}
        {items.map((_, i) => {
          const t = n > 1 ? i / (n - 1) : 0.5;
          const { x, y } = bezier(t);
          return (
            <g key={i} filter="url(#sarc-glow)">
              <circle cx={x} cy={y} r="8" fill="none" stroke="var(--color-harv-mint)" strokeWidth="1" opacity="0.35" />
              <circle cx={x} cy={y} r="3.5" fill="var(--color-harv-mint)" opacity="0.9" />
            </g>
          );
        })}

        {/* Connector lines: from each arc dot down to the items row */}
        {items.map((_, i) => {
          const t = n > 1 ? i / (n - 1) : 0.5;
          const { x, y } = bezier(t);
          const lineLen = ITEMS_Y - y - 4; // 4 px gap below the inner dot
          if (lineLen <= 0) return null;
          return (
            <line
              key={`l${i}`}
              x1={x}
              y1={y + 4}
              x2={x}
              y2={y + 4 + lineLen}
              stroke="var(--color-harv-mint)"
              strokeWidth="1"
              strokeOpacity="0.28"
              strokeDasharray="3 4"
            />
          );
        })}
      </svg>

      {/* ── Stat items — absolutely placed inside the arch ─────────── */}
      <div className="absolute inset-x-0 flex justify-around px-8" style={{ top: ITEMS_Y }}>
        {items.map(item => (
          <div key={String(item.label)} className="flex flex-col items-center gap-1.5 text-center">
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-harv">{item.label}</span>
            <span className={`text-3xl font-light leading-tight ${TONE_CLASSES[item.tone ?? "default"]}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
