import type { ElementType, HTMLAttributes, ReactNode } from "react";

type GlassCardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  variant?: "default" | "strong" | "ghost";
  glow?: "none" | "mint" | "gold";
  padding?: "none" | "sm" | "md" | "lg";
  children: ReactNode;
};

const paddings: Record<NonNullable<GlassCardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const glows: Record<NonNullable<GlassCardProps["glow"]>, string> = {
  none: "",
  mint: "shadow-glow",
  gold: "shadow-glow-gold",
};

export const GlassCard = ({
  as,
  variant = "default",
  glow = "none",
  padding = "md",
  className,
  children,
  ...rest
}: GlassCardProps) => {
  const Tag = (as ?? "div") as ElementType;
  const base = variant === "strong" ? "glass-strong" : variant === "ghost" ? "" : "glass";
  return (
    <Tag
      className={`relative overflow-hidden ${base} ${paddings[padding]} ${glows[glow]} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </Tag>
  );
};
