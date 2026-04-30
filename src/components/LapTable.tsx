import {
  formatDistance,
  formatDuration,
  formatPace,
  type LapSummary,
} from '../utils/fit-analyzer';

type Props = {
  laps: LapSummary[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
};

export default function LapTable({ laps, selectedIndex, onSelect }: Props) {
  if (laps.length === 0) {
    return <p className="lap-table-empty">ラップ情報が見つかりませんでした</p>;
  }

  return (
    <table className="lap-table">
      <thead>
        <tr>
          <th aria-label="選択" />
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
            <td>
              <input
                type="radio"
                name="lap-select"
                checked={lap.index === selectedIndex}
                onChange={() => onSelect(lap.index)}
                aria-label={`ラップ ${lap.index} を選択`}
              />
            </td>
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
