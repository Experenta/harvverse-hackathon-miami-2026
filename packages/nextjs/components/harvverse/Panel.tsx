import type { ElementType, HTMLAttributes, ReactNode } from "react";

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  variant?: "default" | "elevated" | "bare" | "hot" | "stamp";
  padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  glow?: "none" | "leaf" | "honey" | "proof";
  crosshair?: boolean;
  children: ReactNode;
};

const paddings: Record<NonNullable<PanelProps["padding"]>, string> = {
  none: "",
  xs: "p-3",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 sm:p-7",
  xl: "p-8 sm:p-10",
};

const variants: Record<NonNullable<PanelProps["variant"]>, string> = {
  default: "panel",
  elevated: "panel-elevated",
  bare: "panel-bare",
  hot: "panel-hot",
  stamp: "panel-stamp",
};

const glows: Record<NonNullable<PanelProps["glow"]>, string> = {
  none: "",
  leaf: "shadow-glow-leaf",
  honey: "shadow-glow-honey",
  proof: "shadow-glow",
};

/**
 * Panel — sharp terminal-style container.
 * Replaces glassmorphism with crisp 1px borders and warm-carbon surfaces.
 * Optional crosshair markers at the four corners for "tactical / CAD" vibe.
 */
export const Panel = ({
  as,
  variant = "default",
  padding = "md",
  glow = "none",
  crosshair = false,
  className,
  children,
  ...rest
}: PanelProps) => {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={`relative ${variants[variant]} ${paddings[padding]} ${glows[glow]} ${
        crosshair ? "crosshair-4" : ""
      } ${className ?? ""}`}
      {...rest}
    >
      {crosshair ? (
        <>
          <span data-corner="tl" aria-hidden />
          <span data-corner="tr" aria-hidden />
          <span data-corner="bl" aria-hidden />
          <span data-corner="br" aria-hidden />
        </>
      ) : null}
      {children}
    </Tag>
  );
};
