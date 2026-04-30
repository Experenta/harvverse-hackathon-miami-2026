type CrosshairProps = {
  className?: string;
  size?: number;
};

/**
 * Crosshair — decorative tactical cross.
 * Use as a background marker on key intersections.
 */
export const Crosshair = ({ className, size = 28 }: CrosshairProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      className={`text-leaf opacity-40 ${className ?? ""}`}
      fill="none"
      aria-hidden
    >
      <line x1="14" y1="0" x2="14" y2="10" stroke="currentColor" strokeWidth="0.6" />
      <line x1="14" y1="18" x2="14" y2="28" stroke="currentColor" strokeWidth="0.6" />
      <line x1="0" y1="14" x2="10" y2="14" stroke="currentColor" strokeWidth="0.6" />
      <line x1="18" y1="14" x2="28" y2="14" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="14" cy="14" r="2" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
};
