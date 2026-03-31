import { useEffect, useRef, useState } from 'react';
import { calculateHealthScore, getDemoHealthScore, type HealthScoreBreakdown } from '../../utils/healthScore';

export { calculateHealthScore };

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ~251.3

interface SubScoreRowProps {
  label: string;
  score: number;
  weight: string;
}

function SubScoreRow({ label, score, weight }: SubScoreRowProps) {
  const color =
    score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-gray-400 truncate">{label}</span>
      <span className="text-xs text-gray-500">{weight}</span>
      <span className={`text-xs font-semibold tabular-nums w-7 text-right ${color}`}>
        {score}
      </span>
    </div>
  );
}

interface GradeBadgeProps {
  grade: HealthScoreBreakdown['grade'];
  label: string;
  color: string;
}

function GradeBadge({ grade, label, color }: GradeBadgeProps) {
  const bg =
    color === 'text-emerald-400'
      ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
      : color === 'text-amber-400'
      ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
      : 'bg-red-400/10 border-red-400/30 text-red-400';

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full border font-bold text-sm ${bg}`}
      >
        {grade}
      </span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

interface HealthScoreProps {
  breakdown?: HealthScoreBreakdown;
}

export function HealthScore({ breakdown }: HealthScoreProps) {
  const data = breakdown ?? getDemoHealthScore();
  const [animated, setAnimated] = useState(false);
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Slight delay so CSS transition is visible on mount
    const id = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(id);
  }, []);

  const fillRatio = animated ? data.total / 100 : 0;
  const dashOffset = CIRCUMFERENCE * (1 - fillRatio);

  const subScores: { label: string; score: number; weight: string }[] = [
    { label: 'Pass Rate',     score: data.passRateScore,  weight: '40%' },
    { label: 'Crash Health',  score: data.crashScore,     weight: '20%' },
    { label: 'Flaky Tests',   score: data.flakyScore,     weight: '15%' },
    { label: 'Device Uptime', score: data.deviceScore,    weight: '10%' },
    { label: 'Triage Speed',  score: data.triageScore,    weight: '10%' },
    { label: 'Test Velocity', score: data.velocityScore,  weight: ' 5%' },
  ];

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-4 relative">
      <h3 className="text-sm font-semibold text-white self-start">Test Health Score</h3>

      {/* Gauge */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`Health score: ${data.total} out of 100`}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Track ring */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          {/* Filled arc — animates via stroke-dashoffset CSS transition */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke={data.ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
          />
          {/* Center: score number */}
          <text
            x="60"
            y="55"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-bold"
            style={{ fill: '#ffffff', fontSize: '22px', fontWeight: 700, fontFamily: 'inherit' }}
          >
            {data.total}
          </text>
          {/* Center: label */}
          <text
            x="60"
            y="73"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fill: '#9CA3AF', fontSize: '9px', fontFamily: 'inherit' }}
          >
            Test Health
          </text>
        </svg>

        {/* Hover tooltip: sub-score breakdown */}
        {hovered && (
          <div
            className="absolute z-20 bottom-full mb-3 left-1/2 -translate-x-1/2 glass-card p-3 min-w-[200px] shadow-xl border border-white/10"
            role="tooltip"
          >
            <p className="text-xs font-semibold text-white mb-2">Score Breakdown</p>
            <div className="space-y-1.5">
              {subScores.map(s => (
                <SubScoreRow key={s.label} {...s} />
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-xs font-bold text-white">{data.total}</span>
            </div>
          </div>
        )}
      </div>

      {/* Grade badge + label */}
      <GradeBadge grade={data.grade} label={data.label} color={data.color} />

      {/* Sub-score mini progress bars for top 4 factors */}
      <div className="w-full space-y-2 pt-1">
        {subScores.slice(0, 4).map(s => {
          const barColor =
            s.score >= 80
              ? 'bg-emerald-500'
              : s.score >= 60
              ? 'bg-amber-500'
              : 'bg-red-500';
          return (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-24 truncate shrink-0">{s.label}</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full`}
                  style={{
                    width: `${animated ? s.score : 0}%`,
                    transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
              </div>
              <span className="text-xs tabular-nums text-gray-500 w-6 text-right">{s.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
