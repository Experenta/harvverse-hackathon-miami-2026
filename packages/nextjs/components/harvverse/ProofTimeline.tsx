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

const dotColor: Record<ProofStep["state"], string> = {
  done: "var(--color-leaf)",
  current: "var(--color-honey)",
  upcoming: "var(--color-paper-3)",
};

const labelClass: Record<ProofStep["state"], string> = {
  done: "text-paper",
  current: "text-honey",
  upcoming: "text-paper-3",
};

/**
 * ProofTimeline — vertical chain-of-state with square markers and a single
 * connecting rail.
 */
export const ProofTimeline = ({ steps, className }: ProofTimelineProps) => {
  return (
    <ol className={`relative grid gap-5 ${className ?? ""}`}>
      <span
        aria-hidden
        className="absolute bottom-2 left-[7px] top-2 w-px"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--color-leaf) 60%, transparent), color-mix(in oklab, var(--color-rule) 100%, transparent), transparent)",
        }}
      />
      {steps.map(step => (
        <li key={step.id} className="relative grid grid-cols-[20px_1fr] gap-4">
          <span
            className="mt-1 inline-flex h-4 w-4 items-center justify-center border"
            style={{
              borderColor: dotColor[step.state],
              backgroundColor: step.state === "upcoming" ? "transparent" : dotColor[step.state],
              borderRadius: 1,
            }}
          >
            {step.state === "current" ? (
              <span className="live-dot" data-tone="honey" aria-hidden style={{ width: 4, height: 4 }} />
            ) : null}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className={`text-sm ${labelClass[step.state]}`}>{step.label}</span>
              {step.timestamp ? <span className="coordinate">{step.timestamp}</span> : null}
            </div>
            {step.description ? <p className="mt-1 text-sm text-paper-2">{step.description}</p> : null}
            {step.hash ? <MonoHash value={step.hash} truncate={6} className="mt-2" /> : null}
          </div>
        </li>
      ))}
    </ol>
  );
};
