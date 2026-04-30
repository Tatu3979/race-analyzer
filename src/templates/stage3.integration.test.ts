import { describe, it, expect } from 'vitest';
import { stage3Template } from './stage3';
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

describe('stage3Template integration', () => {
  it('fills all placeholders using stage2 value map directly', () => {
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
        subGoalDistance: '10km',
        subGoalTimeH: '0',
        subGoalTimeM: '42',
        subGoalTimeS: '00',
        subGoalDate: '2026-08-01',
      },
      segments,
      segmentSize: 1000,
      totalDistanceM: 5000,
      totalTimerTime: 1200,
      today: FIXED_TODAY,
    });
    const stage2 = buildStage2Values(stage1, '長期', computePhaseDistribution(22));
    const out = fillTemplate(stage3Template, stage2);
    expect(out).not.toMatch(/\{[a-zA-Z]\w*\}/);
    expect(out).toContain('基礎期');
  });

  it('still fills phase2Weeks placeholder for short/middle modes (allows empty)', () => {
    const stage1 = buildStage1Values({
      raceForm: {
        ...emptyRaceForm,
        goalDistance: '5000m',
        goalTimeH: '0',
        goalTimeM: '18',
        goalTimeS: '00',
        raceDate: '2026-05-15',
        monthlyMileage: '120',
        maxSingleRunDistance: '15',
      },
      segments,
      segmentSize: 200,
      totalDistanceM: 5000,
      totalTimerTime: 1100,
      today: FIXED_TODAY,
    });
    const stage2 = buildStage2Values(stage1, '短期', computePhaseDistribution(2));
    const out = fillTemplate(stage3Template, stage2);
    expect(out).not.toMatch(/\{[a-zA-Z]\w*\}/);
  });
});
