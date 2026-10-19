type Variant = "dawn" | "misty" | "midday" | "dusk";

interface RidgeIllustrationProps {
  variant?: Variant;
  className?: string;
  showRaven?: boolean;
}

const PALETTES: Record<
  Variant,
  { sky: [string, string]; far: string; mid: string; near: string; orb?: string; orbY: number }
> = {
  dawn: {
    sky: ["#e8b454", "#f4f0e3"],
    far: "#a7b79a",
    mid: "#5c8060",
    near: "#223f2c",
    orb: "#faedd2",
    orbY: 118,
  },
  misty: {
    sky: ["#c7d1c2", "#f4f0e3"],
    far: "#c2cabb",
    mid: "#8fa88f",
    near: "#3f6a45",
    orbY: 60,
  },
  midday: {
    sky: ["#dfe6da", "#f4f0e3"],
    far: "#9cb097",
    mid: "#4f7a55",
    near: "#1b3627",
    orb: "#f4f0e3",
    orbY: 40,
  },
  dusk: {
    sky: ["#8f3c22", "#0e1c15"],
    far: "#3a352a",
    mid: "#223f2c",
    near: "#0e1c15",
    orb: "#e8b454",
    orbY: 130,
  },
};

/** Layered ridge-line illustration used as the branded stand-in for trail photography. */
export default function RidgeIllustration({ variant = "dawn", className, showRaven = true }: RidgeIllustrationProps) {
  const p = PALETTES[variant];
  const gradId = `sky-${variant}`;

  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="100%" stopColor={p.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${gradId})`} />
      {p.orb && <circle cx="320" cy={p.orbY} r="26" fill={p.orb} opacity="0.9" />}
      {showRaven && (
        <path
          d="M150 58 L162 52 L172 58 L162 56 Z M190 44 L202 38 L212 44 L202 42 Z"
          fill={p.near}
          opacity="0.55"
        />
      )}
      <path d="M0 150 L40 118 L90 142 L140 104 L200 138 L260 100 L320 136 L400 112 L400 240 L0 240 Z" fill={p.far} opacity="0.65" />
      <path d="M0 178 L50 148 L110 172 L170 132 L230 168 L300 138 L400 166 L400 240 L0 240 Z" fill={p.mid} opacity="0.8" />
      <path d="M0 210 L60 182 L120 206 L190 168 L250 202 L330 176 L400 200 L400 240 L0 240 Z" fill={p.near} />
    </svg>
  );
}
