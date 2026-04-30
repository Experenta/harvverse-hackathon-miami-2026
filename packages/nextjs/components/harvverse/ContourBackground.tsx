type ContourBackgroundProps = {
  className?: string;
  variant?: "default" | "dense" | "sparse";
};

/**
 * ContourBackground — topographic contour lines as background texture.
 * Evokes a field journal / agronomy map.  Pure SVG so it scales sharp.
 */
export const ContourBackground = ({ className, variant = "default" }: ContourBackgroundProps) => {
  const lines = variant === "dense" ? 24 : variant === "sparse" ? 8 : 14;

  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="contour-mask" cx="50%" cy="60%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="0.7" />
          <stop offset="60%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="contour-fade">
          <rect x="0" y="0" width="1200" height="800" fill="url(#contour-mask)" />
        </mask>
      </defs>
      <g mask="url(#contour-fade)" stroke="currentColor" fill="none" className="text-leaf">
        {Array.from({ length: lines }).map((_, i) => {
          const r = 80 + i * (lines === 8 ? 60 : lines === 14 ? 42 : 28);
          const offsetX = i % 2 === 0 ? 0 : 6;
          return (
            <ellipse
              key={i}
              cx={620 + offsetX}
              cy={520}
              rx={r * 1.6}
              ry={r * 0.55}
              strokeWidth={i % 4 === 0 ? "1.2" : "0.5"}
              strokeOpacity={i % 4 === 0 ? "0.16" : "0.08"}
            />
          );
        })}
      </g>
    </svg>
  );
};
