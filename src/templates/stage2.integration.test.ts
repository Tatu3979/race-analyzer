import { describe, it, expect } from 'vitest';
import { stage2Template } from './stage2';
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

describe('stage2Template integration', () => {
  it('fills all placeholders for long-period mode', () => {
    const stage1 = buildStage1Values({
      raceForm: {
        ...emptyRaceForm,
        goalDistance: 'フル',
        goalTime: '3:30:00',
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
    const out = fillTemplate(stage2Template, stage2);
    expect(out).not.toMatch(/\{[a-zA-Z]\w*\}/);
    expect(out).toContain('Stage 1 で特定');
    expect(out).toContain('180');
    expect(out).toContain('長期');
  });
});
