"use client";

import { useEffect, useState } from "react";
import { LiveDot } from "./LiveDot";

export type OracleToastSpec = {
  id: string;
  label: string;
  value: string;
  source: string;
  tone?: "leaf" | "honey" | "proof" | "torch";
  delay: number;
};

type OracleToastStackProps = {
  toasts: OracleToastSpec[];
  duration?: number;
};

/**
 * OracleToastStack — cascading Chainlink-style oracle confirmation toasts.
 * Each toast shows source + value, animates in with a ticker-rise, then dismisses.
 */
export const OracleToastStack = ({ toasts, duration = 4000 }: OracleToastStackProps) => {
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const enterTimers = toasts.map(toast =>
      setTimeout(() => setVisible(v => ({ ...v, [toast.id]: true })), toast.delay),
    );
    const exitTimers = toasts.map(toast =>
      setTimeout(() => setVisible(v => ({ ...v, [toast.id]: false })), toast.delay + duration),
    );
    return () => {
      enterTimers.forEach(t => clearTimeout(t));
      exitTimers.forEach(t => clearTimeout(t));
    };
  }, [toasts, duration]);

  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-40 flex w-full max-w-3xl -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map(toast => {
        const show = visible[toast.id];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto panel-elevated flex items-center gap-4 px-4 py-3 transition-all duration-500 ${
              show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{ borderLeft: `2px solid var(--color-${toast.tone ?? "proof"})` }}
          >
            <LiveDot tone={toast.tone ?? "proof"} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper-3">{toast.source}</span>
            <span className="text-sm text-paper">{toast.label}</span>
            <span className="ml-auto font-mono text-sm text-paper">{toast.value}</span>
          </div>
        );
      })}
    </div>
  );
};
