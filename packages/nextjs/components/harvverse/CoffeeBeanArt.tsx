type CoffeeBeanArtProps = {
  className?: string;
  variant?: "hero" | "inline";
};

export const CoffeeBeanArt = ({ className, variant = "hero" }: CoffeeBeanArtProps) => {
  const animate = variant === "hero";

  return (
    <div className={`pointer-events-none relative ${className ?? ""}`}>
      <svg viewBox="0 0 520 520" className={`h-full w-full ${animate ? "animate-float-slow" : ""}`} aria-hidden>
        <defs>
          <radialGradient id="beanCore" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#2a4a3d" />
            <stop offset="55%" stopColor="#0e2a23" />
            <stop offset="100%" stopColor="#040c0a" />
          </radialGradient>
          <radialGradient id="beanHighlight" cx="35%" cy="30%" r="40%">
            <stop offset="0%" stopColor="#7fffd4" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#7fffd4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="beanGold" cx="55%" cy="60%" r="55%">
            <stop offset="0%" stopColor="#c8a96b" stopOpacity="0" />
            <stop offset="80%" stopColor="#c8a96b" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#c8a96b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7fffd4" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#22a06b" stopOpacity="0" />
          </linearGradient>
          <filter id="beanBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Orbital rings */}
        <g opacity="0.45">
          <ellipse cx="260" cy="260" rx="240" ry="66" fill="none" stroke="url(#ringGrad)" strokeWidth="1" />
          <ellipse
            cx="260"
            cy="260"
            rx="200"
            ry="50"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="0.7"
            transform="rotate(-12 260 260)"
          />
          <ellipse
            cx="260"
            cy="260"
            rx="180"
            ry="38"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="0.5"
            transform="rotate(18 260 260)"
          />
        </g>

        {/* Glow halo */}
        <circle cx="260" cy="260" r="180" fill="url(#beanGold)" />

        {/* Bean shadow */}
        <ellipse cx="270" cy="430" rx="160" ry="14" fill="#000" opacity="0.4" filter="url(#beanBlur)" />

        {/* Bean body */}
        <g transform="translate(260 260)">
          <g transform="rotate(-22)">
            <ellipse cx="0" cy="0" rx="170" ry="115" fill="url(#beanCore)" />
            <ellipse cx="0" cy="0" rx="170" ry="115" fill="url(#beanHighlight)" />
            {/* Bean center crease */}
            <path
              d="M -150 0 C -90 -38, -30 -28, 0 0 C 30 28, 90 38, 150 0"
              fill="none"
              stroke="#040c0a"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M -150 0 C -90 -38, -30 -28, 0 0 C 30 28, 90 38, 150 0"
              fill="none"
              stroke="#7fffd4"
              strokeOpacity="0.35"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Side highlights */}
            <path
              d="M -140 -30 C -100 -70, -40 -90, 30 -85"
              fill="none"
              stroke="#7fffd4"
              strokeOpacity="0.25"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 60 70 C 100 80, 130 60, 150 30"
              fill="none"
              stroke="#c8a96b"
              strokeOpacity="0.35"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* Floating data dots */}
        <g>
          <circle cx="100" cy="120" r="3" fill="#7fffd4" opacity="0.7" />
          <circle cx="430" cy="180" r="2.5" fill="#c8a96b" opacity="0.7" />
          <circle cx="80" cy="380" r="2" fill="#22a06b" opacity="0.7" />
          <circle cx="450" cy="380" r="3" fill="#7fffd4" opacity="0.5" />
          <circle cx="380" cy="80" r="1.5" fill="#7fffd4" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
};
