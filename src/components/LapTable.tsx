import {
  formatDistance,
  formatDuration,
  formatPace,
  type LapSummary,
} from '../utils/fit-analyzer';

type Props = { laps: LapSummary[] };

export default function LapTable({ laps }: Props) {
  if (laps.length === 0) {
    return <p className="lap-table-empty">ラップ情報が見つかりませんでした</p>;
  }

  return (
    <table className="lap-table">
      <thead>
        <tr>
          <th>#</th>
          <th>距離</th>
          <th>タイム</th>
          <th>ペース (/km)</th>
          <th>平均HR</th>
          <th>平均ピッチ (spm)</th>
        </tr>
      </thead>
      <tbody>
        {laps.map((lap) => (
          <tr key={lap.index}>
            <td>{lap.index}</td>
            <td>{formatDistance(lap.distanceKm)}</td>
            <td>{formatDuration(lap.durationSec)}</td>
            <td>{formatPace(lap.pacePerKmSec)}</td>
            <td>{lap.avgHeartRate ?? '—'}</td>
            <td>{lap.avgPitchSpm == null ? '—' : Math.round(lap.avgPitchSpm)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
