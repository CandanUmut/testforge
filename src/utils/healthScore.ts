export interface HealthScoreInput {
  passRate7d: number;           // 0-1
  passRateTrend: number;        // -1 to +1
  openCriticalCrashes: number;
  openHighCrashes: number;
  flakyTestRatio: number;       // 0-1
  deviceOnlineRatio: number;    // 0-1
  avgCrashTriageTimeHrs: number;
  testsPerDay7dAvg: number;
}

export interface HealthScoreBreakdown {
  total: number;
  passRateScore: number;
  crashScore: number;
  flakyScore: number;
  deviceScore: number;
  triageScore: number;
  velocityScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  color: string;
  ringColor: string;
}

export function calculateHealthScore(input: HealthScoreInput): HealthScoreBreakdown {
  const passRateScore = Math.min(100, input.passRate7d * 100 + input.passRateTrend * 10);
  const crashPenalty = input.openCriticalCrashes * 15 + input.openHighCrashes * 5;
  const crashScore = Math.max(0, 100 - crashPenalty);
  const flakyScore = Math.max(0, 100 - input.flakyTestRatio * 100);
  const deviceScore = input.deviceOnlineRatio * 100;
  const triageScore = Math.max(0, 100 - input.avgCrashTriageTimeHrs * 2);
  const velocityScore = Math.min(100, input.testsPerDay7dAvg * 5);

  const total = Math.round(Math.max(0, Math.min(100,
    passRateScore * 0.40 +
    crashScore    * 0.20 +
    flakyScore    * 0.15 +
    deviceScore   * 0.10 +
    triageScore   * 0.10 +
    velocityScore * 0.05
  )));

  const grade: HealthScoreBreakdown['grade'] =
    total >= 90 ? 'A' : total >= 80 ? 'B' : total >= 70 ? 'C' : total >= 60 ? 'D' : 'F';

  const label =
    total >= 80 ? 'Healthy' : total >= 60 ? 'Needs attention' : 'Critical';

  const color =
    total >= 80 ? 'text-emerald-400' : total >= 60 ? 'text-amber-400' : 'text-red-400';

  const ringColor =
    total >= 80 ? '#10B981' : total >= 60 ? '#F59E0B' : '#EF4444';

  return {
    total,
    passRateScore: Math.round(passRateScore),
    crashScore: Math.round(crashScore),
    flakyScore: Math.round(flakyScore),
    deviceScore: Math.round(deviceScore),
    triageScore: Math.round(triageScore),
    velocityScore: Math.round(velocityScore),
    grade,
    label,
    color,
    ringColor,
  };
}

export function getDemoHealthScore(): HealthScoreBreakdown {
  return calculateHealthScore({
    passRate7d: 0.82,
    passRateTrend: 0.042,
    openCriticalCrashes: 1,
    openHighCrashes: 2,
    flakyTestRatio: 0.03,
    deviceOnlineRatio: 0.67,
    avgCrashTriageTimeHrs: 8,
    testsPerDay7dAvg: 6.7,
  });
}
