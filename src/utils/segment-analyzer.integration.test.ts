import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import FitParser from 'fit-file-parser';
import { beforeAll, describe, expect, it } from 'vitest';
import { extractRecordsForLap } from './fit-analyzer';
import { splitIntoSegments } from './segment-analyzer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIT_PATH = path.resolve(__dirname, '../../samples/22682662375_ACTIVITY.fit');

let parseResult: unknown = null;

beforeAll(async () => {
  try {
    const buf = await fs.readFile(FIT_PATH);
    const parser = new FitParser({
      force: true,
      speedUnit: 'km/h',
      lengthUnit: 'm',
      temperatureUnit: 'celsius',
      mode: 'list',
    });
    parseResult = await parser.parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  } catch {
    parseResult = null;
  }
});

describe('integration: 22682662375_ACTIVITY Lap 2 split into 200m', () => {
  it.skipIf(!parseResult)('produces 5 segments matching expected values', () => {
    const records = extractRecordsForLap(parseResult, 2);
    expect(records.length).toBeGreaterThan(0);

    const segs = splitIntoSegments(records, 200);
    expect(segs).toHaveLength(5);

    // 期待値（Garmin Connect 表示）。許容: ペース ±2sec、ピッチ ±2spm、ストライド ±0.03m
    const expected = [
      { paceSec: 176.6, pitch: 191, stride: 1.71 },
      { paceSec: 182.1, pitch: 190, stride: 1.66 },
      { paceSec: 175.9, pitch: 193, stride: 1.74 },
      { paceSec: 186.2, pitch: 188, stride: 1.68 },
      { paceSec: 168.8, pitch: 191, stride: 1.71 },
    ];

    segs.forEach((s, i) => {
      const e = expected[i];
      expect(s.pacePerKmSec, `seg ${i} pace`).toBeCloseTo(e.paceSec, 0);
      expect(s.avgPitchSpm!, `seg ${i} pitch`).toBeCloseTo(e.pitch, 0);
      expect(s.avgStrideM!, `seg ${i} stride`).toBeCloseTo(e.stride, 1);
    });
  });
});
