type PhaseRailItem = {
  id: string;
  label: string;
  state: "done" | "current" | "pending";
};

type PhaseRailProps = {
  items: PhaseRailItem[];
  className?: string;
};

/**
 * PhaseRail — vertical phase tracker for a flow (e.g. Discover → Configure →
 * Sign → Execute → Settle).  Compact, terminal-style, anchors the user.
 */
export const PhaseRail = ({ items, className }: PhaseRailProps) => {
  return (
    <ol className={`flex flex-col gap-3 ${className ?? ""}`}>
      {items.map((item, idx) => {
        const isDone = item.state === "done";
        const isCurrent = item.state === "current";
        return (
          <li key={item.id} className="flex items-center gap-3">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center border ${
                isDone
                  ? "border-leaf bg-leaf/20 text-leaf"
                  : isCurrent
                    ? "border-honey bg-honey/15 text-honey"
                    : "border-rule text-paper-3"
              }`}
              style={{ borderRadius: 1 }}
            >
              <span className="font-mono text-[9px] tabular-nums">{String(idx + 1).padStart(2, "0")}</span>
            </span>
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.18em] ${
                isDone ? "text-leaf" : isCurrent ? "text-honey" : "text-paper-3"
              }`}
            >
              {item.label}
            </span>
            {isCurrent ? <span className="live-dot ml-auto" data-tone="honey" aria-hidden /> : null}
          </li>
        );
      })}
    </ol>
  );
};
