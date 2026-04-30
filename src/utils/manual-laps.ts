import type { SegmentMetrics } from './segment-analyzer';

export type ManualLap = {
  distanceKm: string;
  durationM: string;
  durationS: string;
  avgHeartRate: string;
  avgPitchSpm: string;
  avgStrideM: string;
};

export const emptyManualLap: ManualLap = {
  distanceKm: '',
  durationM: '',
  durationS: '',
  avgHeartRate: '',
  avgPitchSpm: '',
  avgStrideM: '',
};

function parsePositive(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parseOptional(value: string): number | null {
  if (value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function isLapValid(lap: ManualLap): boolean {
  const km = parsePositive(lap.distanceKm);
  const sec = parsePositive(lap.durationM) * 60 + parsePositive(lap.durationS);
  return km > 0 && sec > 0;
}

export function manualLapsToSegments(laps: ManualLap[]): SegmentMetrics[] {
  let cumulativeM = 0;
  const out: SegmentMetrics[] = [];
  for (const lap of laps) {
    if (!isLapValid(lap)) continue;
    const km = parsePositive(lap.distanceKm);
    const durationSec =
      parsePositive(lap.durationM) * 60 + parsePositive(lap.durationS);
    const startDistanceM = cumulativeM;
    const endDistanceM = cumulativeM + km * 1000;
    cumulativeM = endDistanceM;
    const avgHeartRate = parseOptional(lap.avgHeartRate);
    out.push({
      startDistanceM,
      endDistanceM,
      durationSec,
      pacePerKmSec: durationSec / km,
      avgPitchSpm: parseOptional(lap.avgPitchSpm),
      avgStrideM: parseOptional(lap.avgStrideM),
      avgHeartRate,
      maxHeartRate: avgHeartRate,
      avgStanceTimeMs: null,
      avgVerticalRatioPercent: null,
    });
  }
  return out;
}

export function manualLapsTotalDistanceM(laps: ManualLap[]): number {
  return laps.reduce((sum, lap) => {
    if (!isLapValid(lap)) return sum;
    return sum + parsePositive(lap.distanceKm) * 1000;
  }, 0);
}

export function manualLapsTotalTimerTime(laps: ManualLap[]): number {
  return laps.reduce((sum, lap) => {
    if (!isLapValid(lap)) return sum;
    return sum + parsePositive(lap.durationM) * 60 + parsePositive(lap.durationS);
  }, 0);
}
