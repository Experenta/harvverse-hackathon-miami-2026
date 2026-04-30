import type { ReactNode } from "react";

type StatProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "leaf" | "honey" | "proof" | "torch" | "muted";
  align?: "start" | "center";
  size?: "sm" | "md" | "lg" | "xl";
  bordered?: boolean;
  coordinate?: string;
  className?: string;
};

const toneClass: Record<NonNullable<StatProps["tone"]>, string> = {
  default: "text-paper",
  leaf: "text-leaf",
  honey: "text-honey",
  proof: "text-proof",
  torch: "text-torch",
  muted: "text-paper-2",
};

const sizeClass: Record<NonNullable<StatProps["size"]>, string> = {
  sm: "text-2xl",
  md: "text-3xl sm:text-4xl",
  lg: "text-4xl sm:text-5xl",
  xl: "text-5xl sm:text-6xl",
};

/**
 * Stat — large readout cell. Replaces the old MetricCard pattern with a more
 * editorial / terminal feel.  Default size pairs Fraunces display digits with
 * a kicker label and optional coordinate.
 */
export const Stat = ({
  label,
  value,
  hint,
  tone = "default",
  align = "start",
  size = "md",
  bordered = true,
  coordinate,
  className,
}: StatProps) => {
  const isCenter = align === "center";
  return (
    <div
      className={`group relative flex flex-col gap-2 ${
        bordered ? "panel" : ""
      } ${bordered ? "p-5" : ""} ${isCenter ? "items-center text-center" : ""} ${className ?? ""}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow">{label}</span>
        {coordinate ? <span className="coordinate hidden md:inline">{coordinate}</span> : null}
      </div>
      <div
        className={`font-display ${sizeClass[size]} font-light leading-[0.95] tracking-[-0.03em] ${toneClass[tone]}`}
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
      >
        {value}
      </div>
      {hint ? <div className="text-xs text-paper-3">{hint}</div> : null}
    </div>
  );
};
