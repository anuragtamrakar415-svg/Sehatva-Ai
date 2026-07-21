export function ProgressRing({
  percent,
  size = 96,
  stroke = 10,
  trackColor = "rgba(255,255,255,0.18)",
  progressColor = "#3EE08C",
  label,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  trackColor?: string;
  progressColor?: string;
  label?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{percent}%</span>
        {label && <span className="text-[10px] text-white/70">{label}</span>}
      </div>
    </div>
  );
}
