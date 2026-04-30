type LotMapPreviewProps = {
  lotCode: string;
  hectares: number;
  altitude: string;
  coordinates: string;
  className?: string;
};

/**
 * LotMapPreview — stylized topographic SVG "satellite" preview of a lot.
 * Pure SVG so it scales sharp; uses a deterministic seed from the lot code
 * to vary contour shape across lots.
 */
export const LotMapPreview = ({ lotCode, hectares, altitude, coordinates, className }: LotMapPreviewProps) => {
  const seed = lotCode.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const wobble = (n: number) => ((seed * 9301 + n * 49297) % 233280) / 233280;

  return (
    <div className={`relative overflow-hidden bg-[color:var(--color-ink-2)] ${className ?? ""}`}>
      <svg
        viewBox="0 0 600 360"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={`map-${lotCode}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1612" />
            <stop offset="100%" stopColor="#0a0908" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="600" height="360" fill={`url(#map-${lotCode}-bg)`} />

        {/* topographic ovals */}
        <g stroke="#9bc26c" fill="none">
          {Array.from({ length: 9 }).map((_, i) => (
            <ellipse
              key={i}
              cx={260 + wobble(i) * 60}
              cy={210 + wobble(i + 3) * 30}
              rx={40 + i * 22}
              ry={20 + i * 9}
              strokeWidth={i % 3 === 0 ? "0.9" : "0.4"}
              strokeOpacity={i % 3 === 0 ? "0.55" : "0.3"}
              transform={`rotate(${-12 + wobble(i) * 24} ${260 + wobble(i) * 60} ${210 + wobble(i + 3) * 30})`}
            />
          ))}
        </g>

        {/* light grid */}
        <g stroke="#2a241e" strokeWidth="0.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="360" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} />
          ))}
        </g>

        {/* parcel polygon — the lot */}
        <polygon
          points={`${180 + wobble(1) * 30},${110 + wobble(2) * 30} ${360 - wobble(3) * 30},${130 + wobble(4) * 30} ${380 - wobble(5) * 20},${260 - wobble(6) * 30} ${200 + wobble(7) * 30},${250 - wobble(8) * 30}`}
          fill="rgba(155, 194, 108, 0.12)"
          stroke="#c5e895"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />

        {/* GPS pin */}
        <g transform="translate(290 195)">
          <circle r="14" fill="rgba(95, 255, 170, 0.1)" stroke="#5fffaa" strokeWidth="1" />
          <circle r="3" fill="#5fffaa" />
          <line x1="-20" y1="0" x2="-15" y2="0" stroke="#5fffaa" strokeWidth="0.6" />
          <line x1="20" y1="0" x2="15" y2="0" stroke="#5fffaa" strokeWidth="0.6" />
          <line x1="0" y1="-20" x2="0" y2="-15" stroke="#5fffaa" strokeWidth="0.6" />
          <line x1="0" y1="20" x2="0" y2="15" stroke="#5fffaa" strokeWidth="0.6" />
        </g>

        {/* coord callouts */}
        <g className="font-mono" fontSize="9" fill="#7a7468">
          <text x="20" y="28">
            ⌖ {coordinates}
          </text>
          <text x="20" y="44">
            ▤ {lotCode.toUpperCase()}
          </text>
          <text x="490" y="28">
            {altitude} masl
          </text>
          <text x="490" y="44">
            {hectares} ha
          </text>
          <text x="20" y="346" fill="#5fffaa">
            ▶ live · onchain
          </text>
          <text x="490" y="346">
            satellite · 2025
          </text>
        </g>

        {/* scale bar */}
        <g transform="translate(20 320)">
          <rect x="0" y="0" width="80" height="2" fill="#9bc26c" />
          <line x1="0" y1="-3" x2="0" y2="5" stroke="#9bc26c" strokeWidth="0.6" />
          <line x1="40" y1="-2" x2="40" y2="4" stroke="#9bc26c" strokeWidth="0.6" />
          <line x1="80" y1="-3" x2="80" y2="5" stroke="#9bc26c" strokeWidth="0.6" />
          <text x="0" y="16" className="font-mono" fontSize="7" fill="#7a7468">
            0
          </text>
          <text x="80" y="16" className="font-mono" fontSize="7" fill="#7a7468">
            500m
          </text>
        </g>
      </svg>
    </div>
  );
};
