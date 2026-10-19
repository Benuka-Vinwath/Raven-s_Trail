interface ElevationSparklineProps {
  profile: number[];
  className?: string;
  strokeColor?: string;
}

export default function ElevationSparkline({ profile, className, strokeColor = "var(--color-clay-600)" }: ElevationSparklineProps) {
  const w = 160;
  const h = 40;
  const min = Math.min(...profile);
  const max = Math.max(...profile);
  const range = max - min || 1;

  const points = profile.map((v, i) => {
    const x = (i / (profile.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  });

  const path = `M${points.join(" L")}`;
  const areaPath = `${path} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" role="presentation">
      <path d={areaPath} fill={strokeColor} opacity="0.1" />
      <path d={path} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
