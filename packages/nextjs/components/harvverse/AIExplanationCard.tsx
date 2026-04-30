import { LiveDot } from "./LiveDot";
import { Panel } from "./Panel";
import { CommandLineIcon } from "@heroicons/react/24/outline";

type AIExplanationCardProps = {
  text: string;
  mode?: "fallback" | "ai";
  className?: string;
};

/**
 * AIExplanationCard — small, terminal-style box for plain-language summaries.
 * A static (non-streaming) variant of the Agent panel; used in dashboards.
 */
export const AIExplanationCard = ({ text, mode = "fallback", className }: AIExplanationCardProps) => {
  return (
    <Panel padding="md" className={`scanline ${className ?? ""}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center border border-leaf/30 bg-leaf/10 text-leaf"
            style={{ borderRadius: 1 }}
          >
            <CommandLineIcon className="h-3.5 w-3.5" />
          </span>
          <span className="eyebrow">Plain-language summary</span>
        </div>
        <span
          className="inline-flex items-center gap-1.5 border border-rule px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-paper-3"
          style={{ borderRadius: 1 }}
        >
          {mode === "ai" ? <LiveDot tone="leaf" /> : null}
          {mode === "ai" ? "AI · advisory" : "Fallback · deterministic"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-paper">{text}</p>
      <p className="mt-3 text-[11px] text-paper-3">
        This summary is for context only. It does not compute financial terms, eligibility, or settlement amounts.
      </p>
    </Panel>
  );
};
