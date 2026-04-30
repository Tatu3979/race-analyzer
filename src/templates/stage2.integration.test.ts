import { describe, it, expect } from 'vitest';
import { stage2Template } from './stage2';
import { fillTemplate } from './fillTemplate';
import {
  buildStage1Values,
  buildStage2Values,
  computePhaseDistribution,
} from '../utils/race-context';
import { emptyRaceForm } from './types';
import type { SegmentMetrics } from '../utils/segment-analyzer';

const FIXED_TODAY = new Date('2026-04-30T00:00:00');

const segments: SegmentMetrics[] = [
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

describe('stage2Template integration', () => {
  it('fills all placeholders for long-period mode', () => {
    const stage1 = buildStage1Values({
      raceForm: {
        ...emptyRaceForm,
        goalDistance: 'フル',
        goalTimeH: '3',
        goalTimeM: '30',
        goalTimeS: '00',
        raceDate: '2026-10-01',
        monthlyMileage: '180',
        maxSingleRunDistance: '32',
      },
      segments,
      segmentSize: 1000,
      totalDistanceM: 5000,
      totalTimerTime: 1200,
      today: FIXED_TODAY,
    });
    const stage2 = buildStage2Values(stage1, '長期', computePhaseDistribution(22));
    const out = fillTemplate(stage2Template, stage2);
    expect(out).not.toMatch(/\{[a-zA-Z]\w*\}/);
    expect(out).toContain('Stage 1 で特定');
    expect(out).toContain('180');
    expect(out).toContain('長期');
  });
});
