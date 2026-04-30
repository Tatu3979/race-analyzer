export type SegmentRecord = {
  timestampMs: number;
  distanceM: number;
  heartRate?: number;
  cadence?: number;
  fractionalCadence?: number;
  stanceTime?: number;
  verticalRatio?: number;
};

export type SegmentMetrics = {
  startDistanceM: number;
  endDistanceM: number;
  durationSec: number;
  pacePerKmSec: number;
  avgPitchSpm: number | null;
  avgStrideM: number | null;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  avgStanceTimeMs: number | null;
  avgVerticalRatioPercent: number | null;
};

export type SegmentSize = 200 | 500 | 1000;

export function lerpNullable(
  a: number | undefined,
  b: number | undefined,
  t: number
): number | undefined {
  if (a == null || b == null) return undefined;
  return a + t * (b - a);
}

export function interpolateAt(
  targetDistanceM: number,
  a: SegmentRecord,
  b: SegmentRecord
): SegmentRecord {
  if (b.distanceM === a.distanceM) {
    return { ...a, distanceM: targetDistanceM };
  }
  const t = (targetDistanceM - a.distanceM) / (b.distanceM - a.distanceM);
  return {
    timestampMs: a.timestampMs + t * (b.timestampMs - a.timestampMs),
    distanceM: targetDistanceM,
    heartRate: lerpNullable(a.heartRate, b.heartRate, t),
    cadence: lerpNullable(a.cadence, b.cadence, t),
    fractionalCadence: lerpNullable(a.fractionalCadence, b.fractionalCadence, t),
    stanceTime: lerpNullable(a.stanceTime, b.stanceTime, t),
    verticalRatio: lerpNullable(a.verticalRatio, b.verticalRatio, t),
  };
}

export function splitIntoSegments(
  records: SegmentRecord[],
  segmentSize: SegmentSize
): SegmentMetrics[] {
  if (records.length < 2) return [];
  const maxDistance = records[records.length - 1].distanceM;
  if (maxDistance <= 0) return [];

  const boundaries: number[] = [0];
  for (let d = segmentSize; d < maxDistance; d += segmentSize) {
    boundaries.push(d);
  }
  boundaries.push(maxDistance);

  const segments: SegmentMetrics[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    if (end <= start) continue;

    const startRecord = recordAt(records, start);
    const endRecord = recordAt(records, end);
    const inside = records.filter((r) => r.distanceM > start && r.distanceM < end);
    const evaluated = [startRecord, ...inside, endRecord];

    segments.push(buildSegmentMetrics(start, end, evaluated, inside));
  }
  return segments;
}

function recordAt(records: SegmentRecord[], targetDistanceM: number): SegmentRecord {
  if (targetDistanceM <= records[0].distanceM) {
    return { ...records[0], distanceM: targetDistanceM };
  }
  for (let i = 0; i < records.length - 1; i++) {
    const a = records[i];
    const b = records[i + 1];
    if (a.distanceM <= targetDistanceM && targetDistanceM <= b.distanceM) {
      return interpolateAt(targetDistanceM, a, b);
    }
  }
  const last = records[records.length - 1];
  return { ...last, distanceM: targetDistanceM };
}

function buildSegmentMetrics(
  startDistanceM: number,
  endDistanceM: number,
  evaluated: SegmentRecord[],
  realInside: SegmentRecord[]
): SegmentMetrics {
  const first = evaluated[0];
  const last = evaluated[evaluated.length - 1];
  const durationSec = (last.timestampMs - first.timestampMs) / 1000;
  const distanceM = endDistanceM - startDistanceM;
  const pacePerKmSec = distanceM > 0 ? durationSec / (distanceM / 1000) : 0;

  const cadenceAcc = weightedAvg(evaluated, (r) =>
    r.cadence == null ? null : r.cadence + (r.fractionalCadence ?? 0)
  );

  let avgPitchSpm: number | null = null;
  let avgStrideM: number | null = null;
  if (cadenceAcc.weightedDt > 0) {
    const avgRpm = cadenceAcc.weightedSum / cadenceAcc.weightedDt;
    avgPitchSpm = avgRpm * 2;
    const totalStrides = cadenceAcc.weightedSum / 60;
    const totalSteps = totalStrides * 2;
    if (totalSteps > 0) avgStrideM = distanceM / totalSteps;
  }

  return {
    startDistanceM,
    endDistanceM,
    durationSec,
    pacePerKmSec,
    avgPitchSpm,
    avgStrideM,
    avgHeartRate: weightedAvg(evaluated, (r) => r.heartRate ?? null).result,
    maxHeartRate: maxOf(realInside, (r) => r.heartRate),
    avgStanceTimeMs: weightedAvg(evaluated, (r) => r.stanceTime ?? null).result,
    avgVerticalRatioPercent: weightedAvg(evaluated, (r) => r.verticalRatio ?? null).result,
  };
}

type WeightedAvgResult = {
  result: number | null;
  weightedSum: number;
  weightedDt: number;
};

function weightedAvg(
  records: SegmentRecord[],
  pick: (r: SegmentRecord) => number | null
): WeightedAvgResult {
  let weightedSum = 0;
  let weightedDt = 0;
  for (let i = 0; i < records.length - 1; i++) {
    const a = records[i];
    const b = records[i + 1];
    const va = pick(a);
    const vb = pick(b);
    if (va == null || vb == null) continue;
    const dt = (b.timestampMs - a.timestampMs) / 1000;
    if (dt <= 0) continue;
    const avg = (va + vb) / 2;
    weightedSum += avg * dt;
    weightedDt += dt;
  }
  return {
    result: weightedDt > 0 ? weightedSum / weightedDt : null,
    weightedSum,
    weightedDt,
  };
}

function maxOf(
  records: SegmentRecord[],
  pick: (r: SegmentRecord) => number | undefined
): number | null {
  let max: number | null = null;
  for (const r of records) {
    const v = pick(r);
    if (v == null) continue;
    if (max == null || v > max) max = v;
  }
  return max;
}
