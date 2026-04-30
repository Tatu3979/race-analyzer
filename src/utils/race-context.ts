import { formatDistance, formatDuration, formatPace } from './fit-analyzer';
import type { SegmentMetrics, SegmentSize } from './segment-analyzer';
import type {
  GoalDistanceKey,
  PeriodMode,
  RaceFormValues,
} from '../templates/types';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export function computeWeeksUntil(
  targetDate: string,
  today: Date = new Date(),
): number {
  if (!targetDate) return 0;
  const target = new Date(`${targetDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return 0;
  const diffMs = target.getTime() - today.getTime();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / MS_PER_WEEK);
}

export function derivePeriodMode(weeksUntilRace: number): PeriodMode {
  if (weeksUntilRace < 8) return '短期';
  if (weeksUntilRace < 16) return '中期';
  return '長期';
}

export function computePhaseDistribution(weeksUntilRace: number): {
  phase1: number;
  phase2: number;
  phase3: number;
  phase4: number;
} {
  if (weeksUntilRace < 16) {
    return { phase1: 0, phase2: 0, phase3: 0, phase4: 0 };
  }
  // 仕様: 基礎期40-50% / ビルド期30-40% / 特異期20-25% / テーパリング10-15%
  // 中央値 45/35/22/12 を 100% にスケール → 0.395/0.307/0.193/0.105
  const phase1 = Math.round(weeksUntilRace * 0.395);
  const phase2 = Math.round(weeksUntilRace * 0.307);
  const phase3 = Math.round(weeksUntilRace * 0.193);
  const phase4 = weeksUntilRace - phase1 - phase2 - phase3;
  return { phase1, phase2, phase3, phase4 };
}

export function deriveDataType(totalDistanceM: number): string {
  if (totalDistanceM < 1500) return 'インターバル/タイムトライアル';
  if (totalDistanceM < 2500) return '1500m〜2000m TT';
  if (totalDistanceM < 4000) return '3000m TT';
  if (totalDistanceM < 7500) return '5000m';
  if (totalDistanceM < 15000) return '10km';
  if (totalDistanceM < 30000) return 'ハーフマラソン';
  return 'フルマラソン';
}

export function formatGoalDistance(
  key: GoalDistanceKey | '',
  custom: string,
): string {
  if (key === '') return '';
  if (key === 'カスタム') return custom.trim();
  return key;
}

export function formatSegmentSize(size: SegmentSize): string {
  if (size === 1000) return '1km';
  return `${size}m`;
}

function formatNullable(value: number | null, digits = 0, suffix = ''): string {
  if (value == null) return '—';
  const fixed = digits > 0 ? value.toFixed(digits) : Math.round(value).toString();
  return `${fixed}${suffix}`;
}

export function formatSegmentData(segments: SegmentMetrics[]): string {
  if (segments.length === 0) return '(区間データなし)';
  const header = '| 区間 | 距離 | ペース | 心拍 | ピッチ | ストライド |';
  const sep = '|------|------|--------|------|--------|-----------|';
  const rows = segments.map((s, i) => {
    const distLabel = `${(s.startDistanceM / 1000).toFixed(2)}-${(s.endDistanceM / 1000).toFixed(2)}km`;
    const pace = formatPace(s.pacePerKmSec);
    const hr = formatNullable(s.avgHeartRate);
    const pitch = formatNullable(s.avgPitchSpm, 0, ' spm');
    const stride = formatNullable(s.avgStrideM, 2, ' m');
    return `| ${i + 1} | ${distLabel} | ${pace} | ${hr} | ${pitch} | ${stride} |`;
  });
  return [header, sep, ...rows].join('\n');
}

export function buildStage1Values(args: {
  raceForm: RaceFormValues;
  segments: SegmentMetrics[];
  segmentSize: SegmentSize;
  totalDistanceM: number;
  totalTimerTime: number;
  today?: Date;
}): Record<string, string> {
  const { raceForm, segments, segmentSize, totalDistanceM, totalTimerTime, today } = args;
  const totalDistanceKm = totalDistanceM / 1000;
  const pacePerKmSec = totalDistanceKm > 0 ? totalTimerTime / totalDistanceKm : 0;
  return {
    goalDistance: formatGoalDistance(raceForm.goalDistance, raceForm.goalDistanceCustom),
    goalTime: raceForm.goalTime,
    raceDate: raceForm.raceDate,
    weeksUntilRace: String(computeWeeksUntil(raceForm.raceDate, today)),
    subGoalDistance: formatGoalDistance(raceForm.subGoalDistance, raceForm.subGoalDistanceCustom),
    subGoalTime: raceForm.subGoalTime,
    subGoalDate: raceForm.subGoalDate,
    weeksUntilSubGoal: String(computeWeeksUntil(raceForm.subGoalDate, today)),
    monthlyMileage: raceForm.monthlyMileage,
    maxSingleRunDistance: raceForm.maxSingleRunDistance,
    dataType: deriveDataType(totalDistanceM),
    dataDistance: formatDistance(totalDistanceKm),
    dataTime: formatDuration(totalTimerTime),
    dataPace: formatPace(pacePerKmSec),
    segmentSize: formatSegmentSize(segmentSize),
    segmentData: formatSegmentData(segments),
  };
}

export function buildStage2Values(
  base: Record<string, string>,
  periodMode: PeriodMode,
  phases: { phase1: number; phase2: number; phase3: number; phase4: number },
): Record<string, string> {
  const fmt = (n: number) => (n > 0 ? String(n) : '');
  return {
    ...base,
    periodMode,
    phase1Weeks: fmt(phases.phase1),
    phase2Weeks: fmt(phases.phase2),
    phase3Weeks: fmt(phases.phase3),
    phase4Weeks: fmt(phases.phase4),
  };
}
