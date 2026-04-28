import { GlassCard } from "./GlassCard";
import { SparklesIcon } from "@heroicons/react/24/outline";

type AIExplanationCardProps = {
  text: string;
  mode?: "fallback" | "ai";
  className?: string;
};

export const AIExplanationCard = ({ text, mode = "fallback", className }: AIExplanationCardProps) => {
  return (
    <GlassCard padding="md" className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-harv-mint)]/10 text-[color:var(--color-harv-mint)]">
            <SparklesIcon className="h-4 w-4" />
          </span>
          <span className="eyebrow">Plain-language summary</span>
        </div>
        <span className="rounded-full border border-white/8 bg-white/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-harv">
          {mode === "ai" ? "AI · advisory" : "Fallback · deterministic"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-harv-text/90">{text}</p>
      <p className="mt-3 text-[11px] text-muted-harv">
        This summary is for context only. It does not compute financial terms, eligibility, or settlement amounts.
      </p>
    </GlassCard>
  );
};
