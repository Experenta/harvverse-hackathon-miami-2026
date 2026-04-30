type LiveDotProps = {
  tone?: "proof" | "leaf" | "honey" | "torch";
  className?: string;
  label?: string;
};

/**
 * LiveDot — a pulsing indicator. Use to mark live oracles, streaming feeds,
 * processing states, etc.
 */
export const LiveDot = ({ tone = "proof", className, label }: LiveDotProps) => {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <span className="live-dot" data-tone={tone === "proof" ? undefined : tone} aria-hidden />
      {label ? <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-3">{label}</span> : null}
    </span>
  );
};
