type HarvverseLogoProps = {
  className?: string;
  withWordmark?: boolean;
};

export const HarvverseLogo = ({ className, withWordmark = true }: HarvverseLogoProps) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center">
        <svg viewBox="0 0 40 40" className="h-8 w-8" aria-hidden>
          <defs>
            <linearGradient id="harvLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7fffd4" />
              <stop offset="60%" stopColor="#22a06b" />
              <stop offset="100%" stopColor="#c8a96b" />
            </linearGradient>
            <radialGradient id="harvLogoGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7fffd4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7fffd4" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="20" cy="20" r="18" fill="url(#harvLogoGlow)" />
          <g transform="translate(20 20)">
            {/* Leaf */}
            <path
              d="M 0 -12 C 7 -10, 11 -4, 11 2 C 11 9, 5 13, 0 14 C -5 13, -11 9, -11 2 C -11 -4, -7 -10, 0 -12 Z"
              fill="none"
              stroke="url(#harvLogoGrad)"
              strokeWidth="1.6"
            />
            {/* Bean crease */}
            <path d="M -8 -2 C -4 -6, 4 -6, 8 -2" stroke="url(#harvLogoGrad)" strokeWidth="1.2" fill="none" />
            <path d="M 0 -10 L 0 12" stroke="#7fffd4" strokeOpacity="0.4" strokeWidth="0.8" />
          </g>
        </svg>
      </span>
      {withWordmark ? (
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-medium tracking-[0.18em] text-harv-text uppercase">Harvverse</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-harv">Lot Partnerships</span>
        </span>
      ) : null}
    </div>
  );
};
