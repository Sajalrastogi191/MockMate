// SVG arc-based score gauge (half circle)
export default function ScoreGauge({ score = 0, size = 180 }) {
    const R = 70;
    const cx = 100, cy = 100;
    const startAngle = Math.PI;
    const endAngle = 0;
    const circumference = Math.PI * R;

    const toXY = (angle) => ({
        x: cx + R * Math.cos(angle),
        y: cy + R * Math.sin(angle),
    });

    const s = toXY(startAngle);
    const e = toXY(endAngle);
    const bgPath = `M ${s.x} ${s.y} A ${R} ${R} 0 0 1 ${e.x} ${e.y}`;

    const fraction = Math.min(Math.max(score / 10, 0), 1);
    const scoreAngle = Math.PI - fraction * Math.PI;
    const sv = toXY(Math.PI);
    const ev = toXY(scoreAngle);
    const large = fraction > 0.5 ? 1 : 0;
    const scorePath = fraction === 0
        ? null
        : `M ${sv.x} ${sv.y} A ${R} ${R} 0 ${large} 1 ${ev.x} ${ev.y}`;

    const color =
        score >= 8 ? '#22c55e' : score >= 6 ? '#a78bfa' : score >= 4 ? '#f59e0b' : '#ef4444';

    const label =
        score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Average' : 'Needs Work';

    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size * 0.6} viewBox="60 40 80 65">
                {/* Background arc */}
                <path d={bgPath} fill="none" stroke="#1f2937" strokeWidth="10" strokeLinecap="round" />
                {/* Score arc */}
                {scorePath && (
                    <path
                        d={scorePath}
                        fill="none"
                        stroke={color}
                        strokeWidth="10"
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 6px ${color}80)`, transition: 'all 1s ease' }}
                    />
                )}
                {/* Score text */}
                <text x="100" y="98" textAnchor="middle" fontSize="22" fontWeight="700" fill="white">
                    {score}
                </text>
                <text x="100" y="108" textAnchor="middle" fontSize="6" fill="#6b7280">
                    / 10
                </text>
            </svg>
            <span className="text-sm font-semibold mt-1" style={{ color }}>{label}</span>
        </div>
    );
}
