import { describe, it, expect } from 'vitest';
import {
  emptyManualLap,
  isLapValid,
  manualLapsToSegments,
  manualLapsTotalDistanceM,
  manualLapsTotalTimerTime,
} from './manual-laps';

describe('isLapValid', () => {
  it('rejects empty lap', () => {
    expect(isLapValid(emptyManualLap)).toBe(false);
  });

  it('rejects lap with no distance', () => {
    expect(isLapValid({ ...emptyManualLap, durationM: '4', durationS: '30' })).toBe(false);
  });

  it('rejects lap with no duration', () => {
    expect(isLapValid({ ...emptyManualLap, distanceKm: '1' })).toBe(false);
  });

  it('accepts a complete lap', () => {
    expect(
      isLapValid({ ...emptyManualLap, distanceKm: '1', durationM: '4', durationS: '30' }),
    ).toBe(true);
  });

  it('accepts lap with only seconds', () => {
    expect(isLapValid({ ...emptyManualLap, distanceKm: '0.4', durationS: '90' })).toBe(true);
  });
});

describe('manualLapsToSegments', () => {
  it('returns empty array for empty input', () => {
    expect(manualLapsToSegments([])).toEqual([]);
  });

  it('skips invalid laps', () => {
    const out = manualLapsToSegments([
      emptyManualLap,
      { ...emptyManualLap, distanceKm: '1', durationM: '4', durationS: '30' },
    ]);
    expect(out).toHaveLength(1);
  });

  it('accumulates start/end distances', () => {
    const out = manualLapsToSegments([
      { ...emptyManualLap, distanceKm: '1', durationM: '4', durationS: '30' },
      { ...emptyManualLap, distanceKm: '1', durationM: '4', durationS: '15' },
    ]);
    expect(out).toHaveLength(2);
    expect(out[0].startDistanceM).toBe(0);
    expect(out[0].endDistanceM).toBe(1000);
    expect(out[1].startDistanceM).toBe(1000);
    expect(out[1].endDistanceM).toBe(2000);
  });

  it('computes pace per km', () => {
    const out = manualLapsToSegments([
      { ...emptyManualLap, distanceKm: '1', durationM: '4', durationS: '30' },
    ]);
    expect(out[0].durationSec).toBe(270);
    expect(out[0].pacePerKmSec).toBe(270);
  });

  it('handles half-km laps for pace', () => {
    const out = manualLapsToSegments([
      { ...emptyManualLap, distanceKm: '0.5', durationM: '2', durationS: '15' },
    ]);
    expect(out[0].pacePerKmSec).toBe(270);
  });

  it('parses optional metrics, leaving missing ones as null', () => {
    const out = manualLapsToSegments([
      {
        ...emptyManualLap,
        distanceKm: '1',
        durationM: '4',
        durationS: '30',
        avgHeartRate: '170',
        avgPitchSpm: '180',
      },
    ]);
    expect(out[0].avgHeartRate).toBe(170);
    expect(out[0].avgPitchSpm).toBe(180);
    expect(out[0].avgStrideM).toBeNull();
  });

  it('mirrors avgHeartRate to maxHeartRate', () => {
    const out = manualLapsToSegments([
      {
        ...emptyManualLap,
        distanceKm: '1',
        durationM: '4',
        durationS: '0',
        avgHeartRate: '165',
      },
    ]);
    expect(out[0].maxHeartRate).toBe(165);
  });
});

describe('manualLapsTotalDistanceM', () => {
  it('sums valid laps', () => {
    const total = manualLapsTotalDistanceM([
      { ...emptyManualLap, distanceKm: '1', durationM: '4', durationS: '30' },
      { ...emptyManualLap, distanceKm: '0.5', durationM: '2', durationS: '0' },
      emptyManualLap,
    ]);
    expect(total).toBe(1500);
  });
});

describe('manualLapsTotalTimerTime', () => {
  it('sums valid lap durations in seconds', () => {
    const total = manualLapsTotalTimerTime([
      { ...emptyManualLap, distanceKm: '1', durationM: '4', durationS: '30' },
      { ...emptyManualLap, distanceKm: '1', durationM: '4', durationS: '15' },
      emptyManualLap,
    ]);
    expect(total).toBe(525);
  });
});
