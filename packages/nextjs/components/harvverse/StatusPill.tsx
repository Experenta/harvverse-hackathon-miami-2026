type Status =
  | "available"
  | "pending"
  | "signed"
  | "active"
  | "milestones_attested"
  | "awaiting_settlement"
  | "settled"
  | "expired"
  | "attested"
  | "recorded"
  | "intent_created"
  | "funded"
  | "confirmed"
  | "wrong_chain"
  | "approved";

type StatusPillProps = {
  status: Status | string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
};

const map: Record<string, { dot: string; bg: string; ring: string; text: string }> = {
  available: {
    dot: "bg-[color:var(--color-harv-mint)]",
    bg: "bg-[color:var(--color-harv-mint)]/8",
    ring: "border-[color:var(--color-harv-mint)]/30",
    text: "text-[color:var(--color-harv-mint)]",
  },
  pending: {
    dot: "bg-[color:var(--color-harv-accent)]",
    bg: "bg-[color:var(--color-harv-accent)]/10",
    ring: "border-[color:var(--color-harv-accent)]/30",
    text: "text-[color:var(--color-harv-accent)]",
  },
  signed: {
    dot: "bg-[color:var(--color-harv-mint)]",
    bg: "bg-[color:var(--color-harv-mint)]/8",
    ring: "border-[color:var(--color-harv-mint)]/30",
    text: "text-[color:var(--color-harv-mint)]",
  },
  approved: {
    dot: "bg-[color:var(--color-harv-mint)]",
    bg: "bg-[color:var(--color-harv-mint)]/8",
    ring: "border-[color:var(--color-harv-mint)]/30",
    text: "text-[color:var(--color-harv-mint)]",
  },
  active: {
    dot: "bg-[#34eeb6]",
    bg: "bg-[#34eeb6]/10",
    ring: "border-[#34eeb6]/30",
    text: "text-[#34eeb6]",
  },
  milestones_attested: {
    dot: "bg-[color:var(--color-harv-mint)]",
    bg: "bg-[color:var(--color-harv-mint)]/8",
    ring: "border-[color:var(--color-harv-mint)]/30",
    text: "text-[color:var(--color-harv-mint)]",
  },
  awaiting_settlement: {
    dot: "bg-[color:var(--color-harv-accent)]",
    bg: "bg-[color:var(--color-harv-accent)]/10",
    ring: "border-[color:var(--color-harv-accent)]/30",
    text: "text-[color:var(--color-harv-accent)]",
  },
  settled: {
    dot: "bg-[color:var(--color-harv-mint)]",
    bg: "bg-[color:var(--color-harv-mint)]/12",
    ring: "border-[color:var(--color-harv-mint)]/40",
    text: "text-[color:var(--color-harv-mint)]",
  },
  confirmed: {
    dot: "bg-[#34eeb6]",
    bg: "bg-[#34eeb6]/10",
    ring: "border-[#34eeb6]/30",
    text: "text-[#34eeb6]",
  },
  expired: {
    dot: "bg-[#ff8863]",
    bg: "bg-[#ff8863]/10",
    ring: "border-[#ff8863]/30",
    text: "text-[#ff8863]",
  },
  wrong_chain: {
    dot: "bg-[#ff8863]",
    bg: "bg-[#ff8863]/10",
    ring: "border-[#ff8863]/30",
    text: "text-[#ff8863]",
  },
  attested: {
    dot: "bg-[color:var(--color-harv-mint)]",
    bg: "bg-[color:var(--color-harv-mint)]/8",
    ring: "border-[color:var(--color-harv-mint)]/30",
    text: "text-[color:var(--color-harv-mint)]",
  },
  recorded: {
    dot: "bg-[color:var(--color-harv-muted)]",
    bg: "bg-white/5",
    ring: "border-white/10",
    text: "text-muted-harv",
  },
  intent_created: {
    dot: "bg-[color:var(--color-harv-accent)]",
    bg: "bg-[color:var(--color-harv-accent)]/10",
    ring: "border-[color:var(--color-harv-accent)]/30",
    text: "text-[color:var(--color-harv-accent)]",
  },
  funded: {
    dot: "bg-[color:var(--color-harv-mint)]",
    bg: "bg-[color:var(--color-harv-mint)]/8",
    ring: "border-[color:var(--color-harv-mint)]/30",
    text: "text-[color:var(--color-harv-mint)]",
  },
};

const fallback = {
  dot: "bg-white/40",
  bg: "bg-white/5",
  ring: "border-white/15",
  text: "text-harv-text",
};

const formatLabel = (status: string) => status.replace(/_/g, " ");

export const StatusPill = ({ status, label, className, size = "md" }: StatusPillProps) => {
  const tone = map[status] ?? fallback;
  const text = label ?? formatLabel(status);
  const sizeCls = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${tone.bg} ${tone.ring} ${tone.text} ${sizeCls} font-mono uppercase tracking-wider ${className ?? ""}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot} animate-pulse-glow`} />
      {text}
    </span>
  );
};
