import { describe, it, expect } from 'vitest';
import { stage3Template } from './stage3';
import { fillTemplate } from './fillTemplate';
import { buildStage1Values, buildStage2Values } from '../utils/race-context';
import { emptyRaceForm, emptyStage1to2 } from './types';
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
        goalTime: '3:30:00',
        raceDate: '2026-10-01',
        monthlyMileage: '180',
        maxSingleRunDistance: '32',
        subGoalDistance: '10km',
        subGoalTime: '0:42:00',
        subGoalDate: '2026-08-01',
      },
      segments,
      segmentSize: 1000,
      totalDistanceM: 5000,
      totalTimerTime: 1200,
      today: FIXED_TODAY,
    });
    const stage2 = buildStage2Values(
      stage1,
      {
        ...emptyStage1to2,
        strengthCategory: 'LT2',
        weaknessCategory: '持久力',
        phase1Weeks: '9',
        phase2Weeks: '7',
        phase3Weeks: '4',
        phase4Weeks: '2',
        currentPhase: '基礎期',
        subGoalPositioning: '練習の一環（テーパーなし）',
        achievabilityEvaluation: '達成可能',
      },
      '長期',
    );
    const out = fillTemplate(stage3Template, stage2);
    expect(out).not.toMatch(/\{[a-zA-Z]\w*\}/);
    expect(out).toContain('基礎期');
  });
});
