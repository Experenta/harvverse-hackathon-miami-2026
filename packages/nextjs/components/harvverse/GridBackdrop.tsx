type GridBackdropProps = {
  variant?: "dense" | "sparse";
  className?: string;
};

/**
 * GridBackdrop — soft grid overlay used as page-level texture.
 */
export const GridBackdrop = ({ variant = "sparse", className }: GridBackdropProps) => {
  const cls = variant === "dense" ? "grid-overlay-dense" : "grid-overlay";
  return <div aria-hidden className={`pointer-events-none absolute inset-0 ${cls} ${className ?? ""}`} />;
};
