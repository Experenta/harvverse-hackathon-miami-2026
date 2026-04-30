type HarvverseLogoProps = {
  className?: string;
  withWordmark?: boolean;
  size?: "sm" | "md" | "lg";
};

/**
 * HarvverseLogo — a stylized cherry-and-bean monogram with topographic ring.
 */
export const HarvverseLogo = ({ className, withWordmark = true, size = "md" }: HarvverseLogoProps) => {
  const dim = size === "sm" ? 24 : size === "lg" ? 40 : 30;

  return (
    <div className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <span className="relative inline-flex items-center justify-center" style={{ width: dim, height: dim }}>
        <svg viewBox="0 0 40 40" width={dim} height={dim} aria-hidden>
          <defs>
            <linearGradient id="logo-bean" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c5e895" />
              <stop offset="100%" stopColor="#5e8c3f" />
            </linearGradient>
          </defs>
          {/* contour ring */}
          <circle cx="20" cy="20" r="18" fill="none" stroke="#9bc26c" strokeOpacity="0.2" strokeWidth="0.6" />
          <circle cx="20" cy="20" r="14" fill="none" stroke="#9bc26c" strokeOpacity="0.35" strokeWidth="0.6" />
          {/* cherry / bean cross-section */}
          <ellipse cx="20" cy="20" rx="9" ry="12" fill="url(#logo-bean)" />
          <line x1="20" y1="9" x2="20" y2="31" stroke="#0a0908" strokeWidth="0.8" opacity="0.5" />
          {/* tick mark north */}
          <line x1="20" y1="2" x2="20" y2="5" stroke="#e0b87a" strokeWidth="1.2" />
        </svg>
      </span>
      {withWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[1.05rem] tracking-[-0.02em] text-paper">harvverse</span>
          <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.28em] text-paper-3">
            agronomic terminal
          </span>
        </span>
      ) : null}
    </div>
  );
};
