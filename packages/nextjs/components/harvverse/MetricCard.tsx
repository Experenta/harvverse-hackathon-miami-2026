import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  delta?: string;
  hint?: string;
  tone?: "default" | "mint" | "gold" | "muted" | "leaf" | "honey" | "proof";
  mono?: boolean;
  align?: "start" | "center";
  className?: string;
  valueClassName?: string;
};

const toneClass: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "text-paper",
  mint: "text-proof",
  proof: "text-proof",
  gold: "text-honey",
  honey: "text-honey",
  leaf: "text-leaf",
  muted: "text-paper-2",
};

/**
 * MetricCard — compact stat card.  Now renders inside a sharp `panel` and
 * uses the Fraunces display family for the numeric value.
 */
export const MetricCard = ({
  label,
  value,
  delta,
  hint,
  tone = "default",
  mono = false,
  align = "start",
  className,
  valueClassName,
}: MetricCardProps) => {
  const isCentered = align === "center";

  return (
    <div className={`panel p-5 ${isCentered ? "flex flex-col items-center text-center" : ""} ${className ?? ""}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow">{label}</span>
      </div>
      <div
        className={`mt-2 max-w-full text-[clamp(1.6rem,2.8vw,2.5rem)] font-light leading-[1.0] tracking-[-0.025em] ${toneClass[tone]} ${
          mono ? "font-mono" : "font-display"
        } ${isCentered ? "mx-auto w-full" : ""} ${valueClassName ?? ""}`}
      >
        {value}
      </div>
      {(delta || hint) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {delta ? (
            <span
              className="border border-leaf/30 bg-leaf/10 px-1.5 py-0.5 font-mono text-leaf"
              style={{ borderRadius: 1 }}
            >
              {delta}
            </span>
          ) : null}
          {hint ? <span className="text-paper-3">{hint}</span> : null}
        </div>
      )}
    </div>
  );
};
