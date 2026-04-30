type TopographicLinesProps = {
  className?: string;
  intensity?: "subtle" | "normal" | "bold";
};

export const TopographicLines = ({ className, intensity = "normal" }: TopographicLinesProps) => {
  const opacity = intensity === "subtle" ? 0.18 : intensity === "bold" ? 0.45 : 0.28;

  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
    >
      <defs>
        <linearGradient id="topoStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7fffd4" stopOpacity="0.7" />
          <stop offset="55%" stopColor="#22a06b" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#c8a96b" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id="topoFade" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="60%" stopColor="#000" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000" stopOpacity="1" />
        </radialGradient>
        <mask id="topoMask">
          <rect width="1200" height="700" fill="url(#topoFade)" />
        </mask>
      </defs>
      <g fill="none" stroke="url(#topoStroke)" strokeWidth="0.8" mask="url(#topoMask)" style={{ opacity }}>
        <path d="M-50 280 C 180 220, 360 360, 600 300 S 980 220, 1260 300" />
        <path d="M-50 320 C 200 240, 380 380, 620 330 S 1000 250, 1260 340" />
        <path d="M-50 360 C 220 280, 400 420, 640 370 S 1020 280, 1260 380" />
        <path d="M-50 400 C 240 320, 420 460, 660 410 S 1040 320, 1260 420" />
        <path d="M-50 440 C 260 360, 440 500, 680 450 S 1060 360, 1260 460" />
        <path d="M-50 480 C 280 400, 460 540, 700 490 S 1080 400, 1260 500" />
        <path d="M-50 520 C 300 440, 480 580, 720 530 S 1100 440, 1260 540" />
        <path d="M-50 560 C 320 480, 500 620, 740 570 S 1120 480, 1260 580" />
        <path d="M-50 220 C 160 180, 320 300, 560 240 S 940 170, 1260 250" strokeWidth="0.6" />
        <path d="M-50 180 C 140 140, 300 260, 540 200 S 920 140, 1260 210" strokeWidth="0.5" />
      </g>
      <g fill="none" stroke="#7fffd4" strokeOpacity="0.18" strokeWidth="0.5" mask="url(#topoMask)">
        <circle cx="280" cy="380" r="6" fill="#7fffd4" fillOpacity="0.5" stroke="none" />
        <circle cx="720" cy="320" r="4" fill="#c8a96b" fillOpacity="0.55" stroke="none" />
        <circle cx="980" cy="440" r="5" fill="#22a06b" fillOpacity="0.6" stroke="none" />
      </g>
    </svg>
  );
};
