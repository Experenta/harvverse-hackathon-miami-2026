import type { ReactNode } from "react";

type EyebrowProps = {
  tone?: "default" | "leaf" | "honey" | "proof" | "torch";
  coordinate?: string;
  children: ReactNode;
  className?: string;
};

const toneClass: Record<NonNullable<EyebrowProps["tone"]>, string> = {
  default: "eyebrow",
  leaf: "eyebrow-leaf",
  honey: "eyebrow-honey",
  proof: "eyebrow-proof",
  torch: "eyebrow-torch",
};

/**
 * Eyebrow — kicker label with optional coordinate readout.
 * Used above section titles to evoke a tactical/terminal frame.
 */
export const Eyebrow = ({ tone = "default", coordinate, children, className }: EyebrowProps) => {
  return (
    <span className={`inline-flex items-baseline gap-3 ${className ?? ""}`}>
      <span className={toneClass[tone]}>{children}</span>
      {coordinate ? <span className="coordinate hidden md:inline">·· {coordinate}</span> : null}
    </span>
  );
};
