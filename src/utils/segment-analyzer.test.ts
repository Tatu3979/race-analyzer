import { describe, expect, it } from 'vitest';
import {
  interpolateAt,
  lerpNullable,
  splitIntoSegments,
  type SegmentRecord,
} from './segment-analyzer';

const baseTime = Date.UTC(2026, 3, 30, 9, 0, 0);

function rec(opts: {
  t: number;
  d: number;
  hr?: number;
  cad?: number;
  frac?: number;
  st?: number;
  vr?: number;
}): SegmentRecord {
  return {
    timestampMs: baseTime + opts.t * 1000,
    distanceM: opts.d,
    heartRate: opts.hr,
    cadence: opts.cad,
    fractionalCadence: opts.frac,
    stanceTime: opts.st,
    verticalRatio: opts.vr,
  };
}

describe('lerpNullable', () => {
  it('interpolates when both values exist', () => {
    expect(lerpNullable(10, 20, 0.5)).toBe(15);
  });
  it('returns undefined when either value missing', () => {
    expect(lerpNullable(undefined, 20, 0.5)).toBeUndefined();
    expect(lerpNullable(10, undefined, 0.5)).toBeUndefined();
  });
});

describe('interpolateAt', () => {
  it('midpoint linear interpolation', () => {
    const a = rec({ t: 0, d: 0, hr: 100, cad: 80 });
    const b = rec({ t: 100, d: 200, hr: 150, cad: 90 });
    const r = interpolateAt(100, a, b);
    expect(r.distanceM).toBe(100);
    expect(r.timestampMs).toBe(baseTime + 50 * 1000);
    expect(r.heartRate).toBe(125);
    expect(r.cadence).toBe(85);
  });
  it('handles target equal to a.distanceM', () => {
    const a = rec({ t: 0, d: 0, hr: 100 });
    const b = rec({ t: 100, d: 200, hr: 150 });
    const r = interpolateAt(0, a, b);
    expect(r.distanceM).toBe(0);
    expect(r.timestampMs).toBe(baseTime);
    expect(r.heartRate).toBe(100);
  });
});

describe('splitIntoSegments — synthetic uniform run', () => {
  // 1秒ごとに 1m 進む、cadence=90 一定（片足、両足合算で 180 spm）、HR=160 一定
  const records: SegmentRecord[] = Array.from({ length: 21 }, (_, i) =>
    rec({ t: i, d: i, cad: 90, frac: 0, hr: 160, st: 240, vr: 7.5 })
  );

  it('200m segmentSize on 20m total → 1 segment (partial)', () => {
    const segs = splitIntoSegments(records, 200);
    expect(segs).toHaveLength(1);
    expect(segs[0].startDistanceM).toBe(0);
    expect(segs[0].endDistanceM).toBe(20);
  });

  it('avg pitch is 180 spm', () => {
    const segs = splitIntoSegments(records, 200);
    expect(segs[0].avgPitchSpm).toBeCloseTo(180, 5);
  });

  it('avg HR is 160', () => {
    const segs = splitIntoSegments(records, 200);
    expect(segs[0].avgHeartRate).toBeCloseTo(160, 5);
  });

  it('max HR is 160 (constant)', () => {
    const segs = splitIntoSegments(records, 200);
    expect(segs[0].maxHeartRate).toBe(160);
  });

  it('stride length = totalDistance / totalSteps', () => {
    const segs = splitIntoSegments(records, 200);
    // 20m / (20s × 180 spm / 60) = 20 / 60 = 0.333...
    expect(segs[0].avgStrideM).toBeCloseTo(20 / 60, 4);
  });

  it('pace is durationSec / distanceKm', () => {
    const segs = splitIntoSegments(records, 200);
    // 20s / 0.020km = 1000 sec/km
    expect(segs[0].pacePerKmSec).toBeCloseTo(1000, 1);
  });
});

describe('splitIntoSegments — segment splitting at boundaries', () => {
  // 994m を 1秒ごとに 1m ずつ進む（total 994 records over 994 seconds）
  const records: SegmentRecord[] = Array.from({ length: 995 }, (_, i) =>
    rec({ t: i, d: i, cad: 95, frac: 0.5, hr: 170 })
  );

  it('994m / 200m → 5 segments (last partial: 800-994m)', () => {
    const segs = splitIntoSegments(records, 200);
    expect(segs).toHaveLength(5);
    expect(segs[0].startDistanceM).toBe(0);
    expect(segs[0].endDistanceM).toBe(200);
    expect(segs[4].startDistanceM).toBe(800);
    expect(segs[4].endDistanceM).toBe(994);
  });

  it('each full segment has equal duration', () => {
    const segs = splitIntoSegments(records, 200);
    expect(segs[0].durationSec).toBeCloseTo(200, 1);
    expect(segs[4].durationSec).toBeCloseTo(194, 1);
  });

  it('pitch is (cadence + fractional) × 2 = 191 spm', () => {
    const segs = splitIntoSegments(records, 200);
    expect(segs[0].avgPitchSpm).toBeCloseTo(191, 1);
  });
});

describe('splitIntoSegments — null safety', () => {
  it('returns null for cadence-derived metrics when cadence missing', () => {
    const records: SegmentRecord[] = [
      rec({ t: 0, d: 0, hr: 150 }),
      rec({ t: 100, d: 200, hr: 160 }),
      rec({ t: 200, d: 400, hr: 170 }),
    ];
    const segs = splitIntoSegments(records, 200);
    expect(segs[0].avgPitchSpm).toBeNull();
    expect(segs[0].avgStrideM).toBeNull();
    expect(segs[0].avgHeartRate).not.toBeNull();
  });

  it('returns empty array for too few records', () => {
    expect(splitIntoSegments([], 200)).toEqual([]);
    expect(splitIntoSegments([rec({ t: 0, d: 0 })], 200)).toEqual([]);
  });

  it('returns empty array when total distance is 0', () => {
    const records: SegmentRecord[] = [
      rec({ t: 0, d: 0 }),
      rec({ t: 10, d: 0 }),
    ];
    expect(splitIntoSegments(records, 200)).toEqual([]);
  });
});
