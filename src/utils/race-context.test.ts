import { describe, it, expect } from 'vitest';
import {
  buildStage1Values,
  buildStage2Values,
  computePhaseDistribution,
  computeWeeksUntil,
  derivePeriodMode,
  deriveDataType,
  formatGoalDistance,
  formatSegmentData,
  formatSegmentSize,
} from './race-context';
import type { SegmentMetrics } from './segment-analyzer';
import { emptyRaceForm } from '../templates/types';

const FIXED_TODAY = new Date('2026-04-30T00:00:00');

describe('computeWeeksUntil', () => {
  it('returns 0 for the same day', () => {
    expect(computeWeeksUntil('2026-04-30', FIXED_TODAY)).toBe(0);
  });

  it('returns 1 for 7 days later', () => {
    expect(computeWeeksUntil('2026-05-07', FIXED_TODAY)).toBe(1);
  });

  it('returns 2 for 8 days later (ceil)', () => {
    expect(computeWeeksUntil('2026-05-08', FIXED_TODAY)).toBe(2);
  });

  it('returns 0 for past dates', () => {
    expect(computeWeeksUntil('2026-04-01', FIXED_TODAY)).toBe(0);
  });

  it('returns 0 for invalid date strings', () => {
    expect(computeWeeksUntil('not-a-date', FIXED_TODAY)).toBe(0);
  });

  it('returns 0 for empty input', () => {
    expect(computeWeeksUntil('', FIXED_TODAY)).toBe(0);
  });
});

describe('derivePeriodMode', () => {
  it('returns 短期 for < 8 weeks', () => {
    expect(derivePeriodMode(0)).toBe('短期');
    expect(derivePeriodMode(7)).toBe('短期');
  });

  it('returns 中期 for 8-15 weeks', () => {
    expect(derivePeriodMode(8)).toBe('中期');
    expect(derivePeriodMode(15)).toBe('中期');
  });

  it('returns 長期 for >= 16 weeks', () => {
    expect(derivePeriodMode(16)).toBe('長期');
    expect(derivePeriodMode(30)).toBe('長期');
  });
});

describe('computePhaseDistribution', () => {
  it('returns all zeros for short/middle period', () => {
    expect(computePhaseDistribution(0)).toEqual({ phase1: 0, phase2: 0, phase3: 0, phase4: 0 });
    expect(computePhaseDistribution(15)).toEqual({ phase1: 0, phase2: 0, phase3: 0, phase4: 0 });
  });

  it('sum equals weeksUntilRace at 16 weeks', () => {
    const d = computePhaseDistribution(16);
    expect(d.phase1 + d.phase2 + d.phase3 + d.phase4).toBe(16);
  });

  it('sum equals weeksUntilRace at 30 weeks', () => {
    const d = computePhaseDistribution(30);
    expect(d.phase1 + d.phase2 + d.phase3 + d.phase4).toBe(30);
  });

  it('sum equals weeksUntilRace at 100 weeks', () => {
    const d = computePhaseDistribution(100);
    expect(d.phase1 + d.phase2 + d.phase3 + d.phase4).toBe(100);
  });

  it('phase1 is the largest portion', () => {
    const d = computePhaseDistribution(40);
    expect(d.phase1).toBeGreaterThan(d.phase2);
    expect(d.phase2).toBeGreaterThan(d.phase3);
    expect(d.phase3).toBeGreaterThan(d.phase4);
  });
});

describe('deriveDataType', () => {
  it('classifies by total distance', () => {
    expect(deriveDataType(800)).toBe('インターバル/タイムトライアル');
    expect(deriveDataType(1500)).toBe('1500m〜2000m TT');
    expect(deriveDataType(3000)).toBe('3000m TT');
    expect(deriveDataType(5000)).toBe('5000m');
    expect(deriveDataType(10000)).toBe('10km');
    expect(deriveDataType(21097)).toBe('ハーフマラソン');
    expect(deriveDataType(42195)).toBe('フルマラソン');
  });
});

describe('formatGoalDistance', () => {
  it('returns the key directly for non-custom', () => {
    expect(formatGoalDistance('5000m', '')).toBe('5000m');
    expect(formatGoalDistance('フル', '')).toBe('フル');
  });

  it('returns custom value (trimmed) for カスタム', () => {
    expect(formatGoalDistance('カスタム', '20km TT')).toBe('20km TT');
    expect(formatGoalDistance('カスタム', '  trail 30km  ')).toBe('trail 30km');
  });

  it('returns empty string when key is empty', () => {
    expect(formatGoalDistance('', '')).toBe('');
  });

  it('returns empty string when custom is empty', () => {
    expect(formatGoalDistance('カスタム', '')).toBe('');
  });
});

describe('formatSegmentSize', () => {
  it('formats by size', () => {
    expect(formatSegmentSize(200)).toBe('200m');
    expect(formatSegmentSize(500)).toBe('500m');
    expect(formatSegmentSize(1000)).toBe('1km');
  });
});

describe('formatSegmentData', () => {
  const baseSeg: SegmentMetrics = {
    startDistanceM: 0,
    endDistanceM: 200,
    durationSec: 45,
    pacePerKmSec: 225,
    avgPitchSpm: 185,
    avgStrideM: 1.42,
    avgHeartRate: 175,
    maxHeartRate: 178,
    avgStanceTimeMs: null,
    avgVerticalRatioPercent: null,
  };

  it('returns placeholder for empty array', () => {
    expect(formatSegmentData([])).toBe('(区間データなし)');
  });

  it('renders a markdown table with header + separator + rows', () => {
    const out = formatSegmentData([baseSeg]);
    const lines = out.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('区間');
    expect(lines[0]).toContain('ペース');
    expect(lines[2]).toContain('| 1 |');
    expect(lines[2]).toContain('0.00-0.20km');
    expect(lines[2]).toContain('175');
    expect(lines[2]).toContain('185 spm');
    expect(lines[2]).toContain('1.42 m');
  });

  it('handles null values with em dash', () => {
    const seg: SegmentMetrics = {
      ...baseSeg,
      avgPitchSpm: null,
      avgStrideM: null,
      avgHeartRate: null,
    };
    const out = formatSegmentData([seg]);
    const dataRow = out.split('\n')[2];
    expect(dataRow).toContain('—');
    expect(dataRow).not.toContain('null');
  });
});

const sampleSegments: SegmentMetrics[] = [
  {
    startDistanceM: 0,
    endDistanceM: 1000,
    durationSec: 240,
    pacePerKmSec: 240,
    avgPitchSpm: 180,
    avgStrideM: 1.39,
    avgHeartRate: 170,
    maxHeartRate: 175,
    avgStanceTimeMs: null,
    avgVerticalRatioPercent: null,
  },
];

describe('buildStage1Values', () => {
  it('fills all known placeholders without leaving any {placeholder} when required form is filled', () => {
    const values = buildStage1Values({
      raceForm: {
        ...emptyRaceForm,
        goalDistance: 'フル',
        goalTime: '3:30:00',
        raceDate: '2026-10-01',
        monthlyMileage: '180',
        maxSingleRunDistance: '32',
      },
      segments: sampleSegments,
      segmentSize: 1000,
      totalDistanceM: 5000,
      totalTimerTime: 1200,
      today: FIXED_TODAY,
    });
    expect(values.goalDistance).toBe('フル');
    expect(values.goalTime).toBe('3:30:00');
    expect(values.weeksUntilRace).toBe('22');
    expect(values.dataDistance).toBe('5.00 km');
    expect(values.dataTime).toBe('20:00');
    expect(values.segmentSize).toBe('1km');
    expect(values.segmentData).toContain('| 1 |');
    expect(values.dataType).toBe('5000m');
  });

  it('passes empty strings for unfilled subGoal fields', () => {
    const values = buildStage1Values({
      raceForm: { ...emptyRaceForm, raceDate: '2026-08-01' },
      segments: [],
      segmentSize: 200,
      totalDistanceM: 0,
      totalTimerTime: 0,
      today: FIXED_TODAY,
    });
    expect(values.subGoalDistance).toBe('');
    expect(values.subGoalTime).toBe('');
    expect(values.subGoalDate).toBe('');
    expect(values.weeksUntilSubGoal).toBe('0');
  });
});

describe('buildStage2Values', () => {
  const base = { foo: 'bar' };

  it('merges base, periodMode, and computed phase weeks', () => {
    const values = buildStage2Values(base, '長期', {
      phase1: 12,
      phase2: 9,
      phase3: 6,
      phase4: 3,
    });
    expect(values.foo).toBe('bar');
    expect(values.periodMode).toBe('長期');
    expect(values.phase1Weeks).toBe('12');
    expect(values.phase2Weeks).toBe('9');
    expect(values.phase3Weeks).toBe('6');
    expect(values.phase4Weeks).toBe('3');
  });

  it('keeps empty phase weeks when distribution is all zero', () => {
    const values = buildStage2Values(base, '短期', {
      phase1: 0,
      phase2: 0,
      phase3: 0,
      phase4: 0,
    });
    expect(values.phase1Weeks).toBe('');
    expect(values.phase2Weeks).toBe('');
    expect(values.periodMode).toBe('短期');
  });
});
