type LotMapPreviewProps = {
  lotCode: string;
  hectares: number;
  altitude: string;
  coordinates: string;
  className?: string;
};

export const LotMapPreview = ({ lotCode, hectares, altitude, coordinates, className }: LotMapPreviewProps) => {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/8 bg-[#06110f] ${className ?? ""}`}>
      <svg viewBox="0 0 400 240" className="block h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a3c33" />
            <stop offset="100%" stopColor="#284f43" />
          </linearGradient>
          <linearGradient id="hillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2d5d46" />
            <stop offset="100%" stopColor="#17372d" />
          </linearGradient>
          <linearGradient id="fieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f8a58" />
            <stop offset="100%" stopColor="#2f6640" />
          </linearGradient>
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c8a96b" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#8d6f3d" stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="78%" cy="18%" r="32%">
            <stop offset="0%" stopColor="#e8dfb4" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#e8dfb4" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="240" fill="url(#skyGrad)" />
        <rect width="400" height="240" fill="url(#sunGlow)" />

        {/* Hills and horizon */}
        <path
          d="M0 128 C40 92 108 98 158 124 C208 150 276 138 336 108 C360 96 380 96 400 102 L400 240 L0 240 Z"
          fill="url(#hillGrad)"
        />
        <path
          d="M0 150 C42 120 96 124 150 152 C202 180 272 178 322 150 C352 134 376 128 400 132 L400 240 L0 240 Z"
          fill="#234a3a"
        />
        <path
          d="M0 170 C46 148 96 154 146 178 C198 202 270 204 324 182 C354 170 378 166 400 170 L400 240 L0 240 Z"
          fill="#1c3f33"
        />

        {/* Farm fields */}
        <g opacity="0.95">
          <path d="M18 173 L152 154 L166 176 L26 196 Z" fill="url(#fieldGrad)" />
          <path d="M168 176 L292 159 L309 181 L179 201 Z" fill="url(#fieldGrad)" />
          <path d="M36 197 L174 177 L188 199 L44 220 Z" fill="#3f764c" />
          <path d="M194 202 L332 182 L346 204 L204 225 Z" fill="#3b7247" />
        </g>

        {/* Field rows */}
        <g stroke="#b7dfbd" strokeOpacity="0.35" strokeWidth="0.8">
          <line x1="34" y1="183" x2="160" y2="166" />
          <line x1="50" y1="189" x2="174" y2="172" />
          <line x1="66" y1="195" x2="188" y2="178" />
          <line x1="182" y1="187" x2="302" y2="171" />
          <line x1="200" y1="193" x2="318" y2="177" />
          <line x1="216" y1="199" x2="334" y2="183" />
        </g>

        {/* Dirt paths */}
        <path
          d="M0 214 C58 208 120 206 172 212 C214 216 270 224 312 232 L0 240 Z"
          fill="url(#pathGrad)"
          opacity="0.45"
        />
        <path
          d="M248 240 C258 222 270 204 286 192 C308 176 334 164 362 156 C382 150 394 146 400 146 L400 240 Z"
          fill="url(#pathGrad)"
          opacity="0.35"
        />

        {/* Small farmhouse + greenhouse */}
        <g>
          <rect x="286" y="130" width="28" height="16" rx="1.5" fill="#d8c9a3" opacity="0.9" />
          <path d="M284 130 L300 120 L316 130 Z" fill="#8d5d3a" />
          <rect x="330" y="132" width="24" height="14" fill="#8bc4a7" opacity="0.7" />
          <path d="M330 132 L342 122 L354 132" fill="none" stroke="#d9efdf" strokeOpacity="0.7" strokeWidth="1" />
        </g>

        {/* Decorative subtle topographic lines */}
        <g fill="none" stroke="#7fffd4" strokeOpacity="0.16" strokeWidth="0.7">
          <path d="M0 60 C60 44 110 68 170 58 C226 49 284 38 400 52" />
          <path d="M0 80 C66 68 124 90 184 82 C242 76 296 60 400 72" />
        </g>

        {/* Lot centroid marker */}
        <circle cx="206" cy="172" r="4.5" fill="#c8a96b" opacity="0.95" />
        <circle cx="206" cy="172" r="10" fill="none" stroke="#c8a96b" strokeOpacity="0.5" />
      </svg>

      <div className="absolute inset-0 flex flex-col justify-between p-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="eyebrow">{lotCode}</span>
          <span className="font-mono text-[10px] text-muted-harv">{coordinates}</span>
        </div>
        <div className="flex items-center justify-between font-mono text-[11px] text-muted-harv">
          <span>{hectares} ha</span>
          <span>{altitude} masl</span>
        </div>
      </div>
    </div>
  );
};
