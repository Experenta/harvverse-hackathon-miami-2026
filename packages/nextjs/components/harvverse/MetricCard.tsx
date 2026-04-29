import type { ReactNode } from "react";
import { GlassCard } from "./GlassCard";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  delta?: string;
  hint?: string;
  tone?: "default" | "mint" | "gold" | "muted";
  mono?: boolean;
  align?: "start" | "center";
  className?: string;
  valueClassName?: string;
};

const tones: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "text-harv-text",
  mint: "text-[color:var(--color-harv-mint)]",
  gold: "text-[color:var(--color-harv-accent)]",
  muted: "text-muted-harv",
};

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
    <GlassCard
      padding="md"
      className={`${isCentered ? "text-center" : ""} ${className ?? ""} ${isCentered ? "flex flex-col items-center" : ""}`}
    >
      <div className="eyebrow">{label}</div>
      <div
        className={`mt-3 max-w-full break-normal text-[clamp(1.45rem,2.7vw,2.25rem)] font-light leading-[1.1] tracking-tight ${tones[tone]} ${
          mono ? "font-mono" : ""
        } ${isCentered ? "mx-auto w-full px-2 text-center" : ""} ${valueClassName ?? ""}`}
      >
        {value}
      </div>
      {(delta || hint) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {delta ? (
            <span className="rounded-md border border-[color:var(--color-harv-mint)]/20 bg-[color:var(--color-harv-mint)]/5 px-1.5 py-0.5 font-mono text-[color:var(--color-harv-mint)]">
              {delta}
            </span>
          ) : null}
          {hint ? <span className="text-muted-harv">{hint}</span> : null}
        </div>
      )}
    </GlassCard>
  );
};
