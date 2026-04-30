import { describe, it, expect } from 'vitest';
import { stage1Template } from './stage1';
import { fillTemplate } from './fillTemplate';
import { buildStage1Values } from '../utils/race-context';
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

describe('stage1Template integration', () => {
  it('fills all placeholders with no leftovers when required form fields are present', () => {
    const values = buildStage1Values({
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
      segmentSizeLabel: '1km',
      totalDistanceM: 5000,
      totalTimerTime: 1200,
      today: FIXED_TODAY,
    });
    const out = fillTemplate(stage1Template, values);
    expect(out).not.toMatch(/\{[a-zA-Z]\w*\}/);
    expect(out).toContain('フル');
    expect(out).toContain('3:30:00');
    expect(out).toContain('180');
    expect(out).toContain('5.00 km');
    expect(out).toContain('5000m');
    expect(out).toContain('1km');
    expect(out).toContain('| 1 |');
  });
});
