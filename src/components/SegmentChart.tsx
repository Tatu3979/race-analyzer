import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPace } from '../utils/fit-analyzer';
import type { SegmentMetrics } from '../utils/segment-analyzer';

type Props = { segments: SegmentMetrics[] };

type Row = {
  label: string;
  paceSec: number;
  pitch: number | null;
  strideM: number | null;
};

export default function SegmentChart({ segments }: Props) {
  if (segments.length === 0) return null;

  const data: Row[] = segments.map((s) => ({
    label: `${Math.round(s.startDistanceM)}-${Math.round(s.endDistanceM)}m`,
    paceSec: Math.round(s.pacePerKmSec * 10) / 10,
    pitch: s.avgPitchSpm == null ? null : Math.round(s.avgPitchSpm * 10) / 10,
    strideM: s.avgStrideM == null ? null : Math.round(s.avgStrideM * 100) / 100,
  }));

  return (
    <div className="segment-chart">
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 16, right: 56, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis
            yAxisId="pace"
            orientation="left"
            reversed
            tickFormatter={(v: number) => formatPace(v)}
            label={{ value: 'ペース (/km)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="pitch"
            orientation="right"
            label={{ value: 'ピッチ (spm)', angle: 90, position: 'insideRight' }}
          />
          <YAxis
            yAxisId="stride"
            orientation="right"
            tickFormatter={(v: number) => v.toFixed(2)}
          />
          <Tooltip formatter={tooltipFormatter} />
          <Legend />
          <Bar
            yAxisId="pace"
            dataKey="paceSec"
            name="ペース"
            fill="#3b82f6"
            barSize={32}
          />
          <Line
            yAxisId="pitch"
            dataKey="pitch"
            name="ピッチ"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            yAxisId="stride"
            dataKey="strideM"
            name="ストライド"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function tooltipFormatter(value: unknown, name: unknown): [string, string] {
  const label = typeof name === 'string' ? name : '';
  if (typeof value !== 'number') return ['—', label];
  if (label === 'ペース') return [formatPace(value), label];
  if (label === 'ストライド') return [`${value.toFixed(2)} m`, label];
  return [`${value}`, label];
}
