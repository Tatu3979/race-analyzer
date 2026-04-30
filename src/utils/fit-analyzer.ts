import FitParser from 'fit-file-parser';
import type { SegmentRecord } from './segment-analyzer';

export type LapSummary = {
  index: number;
  distanceKm: number;
  durationSec: number;
  pacePerKmSec: number;
  avgHeartRate: number | null;
  avgPitchSpm: number | null;
};

type RawLap = {
  start_time?: string;
  total_distance?: number;
  total_timer_time?: number;
  total_elapsed_time?: number;
  avg_heart_rate?: number;
  avg_cadence?: number;
  avg_fractional_cadence?: number;
};

type RawRecord = {
  timestamp?: string;
  distance?: number;
  heart_rate?: number;
  cadence?: number;
  fractional_cadence?: number;
  stance_time?: number;
  vertical_ratio?: number;
};

export async function parseFitFile(file: File): Promise<unknown> {
  const buffer = await file.arrayBuffer();
  const parser = new FitParser({
    force: true,
    speedUnit: 'km/h',
    lengthUnit: 'm',
    temperatureUnit: 'celsius',
    mode: 'list',
  });
  return parser.parseAsync(buffer);
}

export function extractLaps(parseResult: unknown): LapSummary[] {
  const laps = collectLaps(parseResult);
  return laps
    .map((lap, i) => buildLapSummary(lap, i))
    .filter((s): s is LapSummary => s !== null);
}

export function extractRecordsForLap(
  parseResult: unknown,
  lapIndex: number
): SegmentRecord[] {
  const laps = collectLaps(parseResult);
  const lap = laps[lapIndex - 1];
  if (!lap || !lap.start_time) return [];

  const lapStartMs = Date.parse(lap.start_time);
  if (Number.isNaN(lapStartMs)) return [];
  const durationSec = lap.total_timer_time ?? lap.total_elapsed_time ?? 0;
  const lapEndMs = lapStartMs + durationSec * 1000;

  const records = collectRecords(parseResult);
  const filtered = records
    .map((r) => {
      if (!r.timestamp) return null;
      const ts = Date.parse(r.timestamp);
      if (Number.isNaN(ts)) return null;
      if (ts < lapStartMs || ts > lapEndMs) return null;
      return { raw: r, ts };
    })
    .filter((x): x is { raw: RawRecord; ts: number } => x !== null);

  if (filtered.length === 0) return [];

  const baseDistance = filtered[0].raw.distance ?? 0;
  return filtered.map(({ raw, ts }) => ({
    timestampMs: ts,
    distanceM: (raw.distance ?? baseDistance) - baseDistance,
    heartRate: raw.heart_rate,
    cadence: raw.cadence,
    fractionalCadence: raw.fractional_cadence,
    stanceTime: raw.stance_time,
    verticalRatio: raw.vertical_ratio,
  }));
}

function collectRecords(parseResult: unknown): RawRecord[] {
  const root = parseResult as { records?: RawRecord[] } | null;
  return root?.records ?? [];
}

function collectLaps(parseResult: unknown): RawLap[] {
  const root = parseResult as {
    laps?: RawLap[];
    activity?: { sessions?: Array<{ laps?: RawLap[] }> };
  } | null;
  if (!root) return [];
  if (root.laps && root.laps.length > 0) return root.laps;
  return root.activity?.sessions?.flatMap((s) => s.laps ?? []) ?? [];
}

function buildLapSummary(lap: RawLap, i: number): LapSummary | null {
  const distanceM = lap.total_distance ?? 0;
  const durationSec = lap.total_timer_time ?? lap.total_elapsed_time ?? 0;
  if (distanceM <= 0 || durationSec <= 0) return null;

  const distanceKm = distanceM / 1000;
  return {
    index: i + 1,
    distanceKm,
    durationSec,
    pacePerKmSec: durationSec / distanceKm,
    avgHeartRate: lap.avg_heart_rate ?? null,
    avgPitchSpm: computePitchSpm(lap),
  };
}

// FIT の avg_cadence は片足回転数 (rpm)。両足合算 steps/min に変換するため × 2 する。
function computePitchSpm(lap: RawLap): number | null {
  if (lap.avg_cadence == null) return null;
  const fractional = lap.avg_fractional_cadence ?? 0;
  return (lap.avg_cadence + fractional) * 2;
}

export function formatPace(secPerKm: number): string {
  if (!isFinite(secPerKm) || secPerKm <= 0) return '—';
  const totalSec = Math.round(secPerKm);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}'${sec.toString().padStart(2, '0')}"`;
}

export function formatDuration(sec: number): string {
  const total = Math.round(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDistance(km: number): string {
  return `${km.toFixed(2)} km`;
}
