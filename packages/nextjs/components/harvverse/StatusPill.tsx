type StatusPillProps = {
  status: string;
  label?: string;
  size?: "sm" | "md";
  className?: string;
};

const tone: Record<string, { color: string; bg: string; border: string; label?: string }> = {
  available: { color: "var(--color-leaf)", bg: "rgba(155, 194, 108, 0.1)", border: "rgba(155, 194, 108, 0.4)" },
  active: { color: "var(--color-honey)", bg: "rgba(224, 184, 122, 0.1)", border: "rgba(224, 184, 122, 0.4)" },
  reserved: { color: "var(--color-bean)", bg: "rgba(168, 115, 68, 0.12)", border: "rgba(168, 115, 68, 0.4)" },
  settled: { color: "var(--color-proof)", bg: "rgba(95, 255, 170, 0.1)", border: "rgba(95, 255, 170, 0.4)" },
  pending: { color: "var(--color-paper-2)", bg: "rgba(185, 176, 163, 0.06)", border: "rgba(185, 176, 163, 0.25)" },
  signed: { color: "var(--color-leaf)", bg: "rgba(155, 194, 108, 0.1)", border: "rgba(155, 194, 108, 0.4)" },
  approved: { color: "var(--color-leaf)", bg: "rgba(155, 194, 108, 0.1)", border: "rgba(155, 194, 108, 0.4)" },
  expired: { color: "var(--color-cherry)", bg: "rgba(197, 82, 79, 0.12)", border: "rgba(197, 82, 79, 0.4)" },
  rejected: { color: "var(--color-cherry)", bg: "rgba(197, 82, 79, 0.12)", border: "rgba(197, 82, 79, 0.4)" },
  wrong_chain: { color: "var(--color-torch)", bg: "rgba(255, 107, 53, 0.12)", border: "rgba(255, 107, 53, 0.4)" },
  awaiting_settlement: {
    color: "var(--color-honey)",
    bg: "rgba(224, 184, 122, 0.1)",
    border: "rgba(224, 184, 122, 0.4)",
    label: "Awaiting settlement",
  },
  milestones_attested: {
    color: "var(--color-leaf)",
    bg: "rgba(155, 194, 108, 0.1)",
    border: "rgba(155, 194, 108, 0.4)",
    label: "Milestones attested",
  },
  attested: { color: "var(--color-leaf)", bg: "rgba(155, 194, 108, 0.1)", border: "rgba(155, 194, 108, 0.4)" },
  recorded: { color: "var(--color-honey)", bg: "rgba(224, 184, 122, 0.1)", border: "rgba(224, 184, 122, 0.4)" },
  intent_created: {
    color: "var(--color-honey)",
    bg: "rgba(224, 184, 122, 0.1)",
    border: "rgba(224, 184, 122, 0.4)",
    label: "Intent",
  },
  funded: { color: "var(--color-leaf)", bg: "rgba(155, 194, 108, 0.1)", border: "rgba(155, 194, 108, 0.4)" },
  confirmed: { color: "var(--color-proof)", bg: "rgba(95, 255, 170, 0.1)", border: "rgba(95, 255, 170, 0.4)" },
  soon: { color: "var(--color-paper-3)", bg: "rgba(185, 176, 163, 0.04)", border: "rgba(185, 176, 163, 0.2)" },
};

const fallback = {
  color: "var(--color-paper)",
  bg: "rgba(255, 255, 255, 0.04)",
  border: "rgba(255, 255, 255, 0.15)",
};

/**
 * StatusPill — sharp, terminal-style status marker. Replaces the rounded chip
 * with a 1px square-cornered tag and a leading flag dot.
 */
export const StatusPill = ({ status, label, size = "md", className }: StatusPillProps) => {
  const t = tone[status] ?? fallback;
  const padding = size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]";
  const text = label ?? (("label" in t && t.label) || status.replace(/_/g, " "));

  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-mono uppercase tracking-[0.16em] ${padding} ${className ?? ""}`}
      style={{
        color: t.color,
        backgroundColor: t.bg,
        borderColor: t.border,
        borderRadius: 1,
      }}
    >
      <span className="h-1 w-1" style={{ backgroundColor: t.color, borderRadius: 1 }} aria-hidden />
      {text}
    </span>
  );
};
