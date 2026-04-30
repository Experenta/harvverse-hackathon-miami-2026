type CoffeeBeanArtProps = {
  className?: string;
  variant?: "hero" | "inline";
};

/**
 * CoffeeBeanArt — botanical/cartographic coffee composition.
 * Combines a slow-rotating contour reticle with a stylized cherry-and-bean
 * cross-section.  Used as the hero centerpiece.
 */
export const CoffeeBeanArt = ({ className, variant = "hero" }: CoffeeBeanArtProps) => {
  const animate = variant === "hero";

  return (
    <div className={`pointer-events-none relative ${className ?? ""}`}>
      {/* slow rotating outer reticle */}
      <svg
        viewBox="0 0 520 520"
        className={`absolute inset-0 h-full w-full ${animate ? "animate-rotate-slow" : ""}`}
        aria-hidden
      >
        <defs>
          <radialGradient id="bean-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9bc26c" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#9bc26c" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#9bc26c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="260" cy="260" r="240" fill="url(#bean-glow)" />
        {Array.from({ length: 8 }).map((_, i) => (
          <circle
            key={i}
            cx="260"
            cy="260"
            r={60 + i * 26}
            fill="none"
            stroke="#9bc26c"
            strokeOpacity={i % 3 === 0 ? "0.18" : "0.07"}
            strokeWidth={i % 3 === 0 ? "1.2" : "0.6"}
            strokeDasharray={i % 2 === 0 ? "0" : "2 6"}
          />
        ))}
        {[0, 90, 180, 270].map(angle => (
          <g key={angle} transform={`rotate(${angle} 260 260)`}>
            <line x1="260" y1="20" x2="260" y2="38" stroke="#9bc26c" strokeWidth="1.4" />
            <text x="260" y="60" textAnchor="middle" className="font-mono" fontSize="8" fill="#7a7468">
              {angle === 0 ? "N 14°" : angle === 90 ? "E 88°" : angle === 180 ? "S 09°" : "W 91°"}
            </text>
          </g>
        ))}
      </svg>

      {/* central bean illustration */}
      <svg viewBox="0 0 520 520" className="relative h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="bean-shell" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c5e895" />
            <stop offset="50%" stopColor="#9bc26c" />
            <stop offset="100%" stopColor="#5e8c3f" />
          </linearGradient>
          <linearGradient id="bean-meat" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0b87a" />
            <stop offset="100%" stopColor="#a87344" />
          </linearGradient>
          <radialGradient id="cherry" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff8e6a" />
            <stop offset="60%" stopColor="#c5524f" />
            <stop offset="100%" stopColor="#7d2b27" />
          </radialGradient>
        </defs>

        <ellipse cx="260" cy="260" rx="155" ry="180" fill="url(#cherry)" opacity="0.22" />
        <ellipse
          cx="260"
          cy="260"
          rx="155"
          ry="180"
          fill="none"
          stroke="#c5524f"
          strokeOpacity="0.5"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <ellipse cx="260" cy="260" rx="115" ry="148" fill="none" stroke="#e0b87a" strokeOpacity="0.5" strokeWidth="1" />

        <g transform="translate(260 260)">
          <ellipse cx="0" cy="0" rx="92" ry="125" fill="url(#bean-shell)" />
          <path d="M -82 -20 Q 0 -35 82 -20 Q 0 35 -82 -20 Z" fill="url(#bean-meat)" opacity="0.55" />
          <path d="M 0 -118 C 14 -90, 14 -40, 0 -8 C -14 -40, -14 -90, 0 -118 Z" fill="#e0b87a" opacity="0.85" />
          <path d="M 0 8 C 14 40, 14 90, 0 118 C -14 90, -14 40, 0 8 Z" fill="#a87344" opacity="0.85" />
          <line x1="0" y1="-118" x2="0" y2="118" stroke="#5e8c3f" strokeWidth="1" opacity="0.6" />
        </g>

        <g className="font-mono" fontSize="7" fill="#9bc26c" opacity="0.7">
          <text x="40" y="80">
            14°56′47.4″N
          </text>
          <text x="380" y="80">
            88°05′10.7″W
          </text>
          <text x="40" y="450">
            ZAF·L02
          </text>
          <text x="380" y="450">
            1,300 MASL
          </text>
        </g>
      </svg>

      <div className="absolute right-[14%] top-[22%]">
        <span className="live-dot" aria-hidden />
      </div>
      <div className="absolute bottom-[26%] left-[16%]">
        <span className="live-dot" data-tone="honey" aria-hidden />
      </div>
    </div>
  );
};
