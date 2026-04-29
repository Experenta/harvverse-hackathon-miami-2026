import { MonoHash } from "./MonoHash";

export type ProofStep = {
  id: string;
  label: string;
  description?: string;
  state: "done" | "current" | "upcoming";
  hash?: string;
  timestamp?: string;
};

type ProofTimelineProps = {
  steps: ProofStep[];
  className?: string;
};

const dotByState: Record<ProofStep["state"], string> = {
  done: "bg-[color:var(--color-harv-mint)] border-[color:var(--color-harv-mint)]/60 shadow-glow",
  current: "bg-[color:var(--color-harv-accent)] border-[color:var(--color-harv-accent)]/60 shadow-glow-gold",
  upcoming: "bg-transparent border-white/15",
};

const labelByState: Record<ProofStep["state"], string> = {
  done: "text-harv-text",
  current: "text-[color:var(--color-harv-accent)]",
  upcoming: "text-muted-harv",
};

export const ProofTimeline = ({ steps, className }: ProofTimelineProps) => {
  return (
    <ol className={`relative grid gap-5 ${className ?? ""}`}>
      <span
        aria-hidden
        className="absolute left-[14px] top-1 bottom-1 w-px bg-gradient-to-b from-[color:var(--color-harv-mint)]/40 via-white/10 to-transparent"
      />
      {steps.map(step => (
        <li key={step.id} className="relative grid grid-cols-[28px_1fr] gap-4">
          <span
            className={`mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border ${dotByState[step.state]}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-harv-bg)]" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className={`text-sm font-medium ${labelByState[step.state]}`}>{step.label}</span>
              {step.timestamp ? <span className="eyebrow">{step.timestamp}</span> : null}
            </div>
            {step.description ? <p className="mt-1 text-sm text-muted-harv">{step.description}</p> : null}
            {step.hash ? <MonoHash value={step.hash} className="mt-2" /> : null}
          </div>
        </li>
      ))}
    </ol>
  );
};
