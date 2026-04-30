import type { ElementType, HTMLAttributes, ReactNode } from "react";

type GlassCardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  variant?: "default" | "strong" | "ghost";
  glow?: "none" | "mint" | "gold" | "leaf" | "honey" | "proof";
  padding?: "none" | "sm" | "md" | "lg";
  crosshair?: boolean;
  children: ReactNode;
};

const paddings: Record<NonNullable<GlassCardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 sm:p-7",
};

const glows: Record<NonNullable<GlassCardProps["glow"]>, string> = {
  none: "",
  // legacy aliases:
  mint: "shadow-glow",
  gold: "shadow-glow-honey",
  leaf: "shadow-glow-leaf",
  honey: "shadow-glow-honey",
  proof: "shadow-glow",
};

/**
 * GlassCard — legacy alias retained for compatibility. Now renders as a sharp
 * `panel` with the new aesthetic instead of a frosted glass surface.
 */
export const GlassCard = ({
  as,
  variant = "default",
  glow = "none",
  padding = "md",
  crosshair = false,
  className,
  children,
  ...rest
}: GlassCardProps) => {
  const Tag = (as ?? "div") as ElementType;
  const base = variant === "strong" ? "panel-elevated" : variant === "ghost" ? "panel-bare" : "panel";
  return (
    <Tag
      className={`relative ${base} ${paddings[padding]} ${glows[glow]} ${
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
