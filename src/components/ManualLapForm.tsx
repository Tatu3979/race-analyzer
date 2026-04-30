import { emptyManualLap, type ManualLap } from '../utils/manual-laps';

type Props = {
  laps: ManualLap[];
  onChange: (next: ManualLap[]) => void;
};

export default function ManualLapForm({ laps, onChange }: Props) {
  function updateLap<K extends keyof ManualLap>(index: number, key: K, value: ManualLap[K]) {
    const next = laps.slice();
    next[index] = { ...next[index], [key]: value };
    onChange(next);
  }

  function addLap() {
    onChange([...laps, { ...emptyManualLap }]);
  }

  function removeLap(index: number) {
    onChange(laps.filter((_, i) => i !== index));
  }

  return (
    <fieldset className="manual-laps">
      <legend>ラップ手入力</legend>
      <p className="manual-laps-hint">
        距離とタイムは必須、心拍・ピッチ・ストライドは時計で取れていれば入力してください。
      </p>
      <div className="manual-laps-table">
        <div className="manual-laps-row manual-laps-header">
          <span>#</span>
          <span>距離 (km)</span>
          <span>分</span>
          <span>秒</span>
          <span>心拍</span>
          <span>ピッチ</span>
          <span>ストライド (m)</span>
          <span></span>
        </div>
        {laps.map((lap, i) => (
          <div className="manual-laps-row" key={i}>
            <span className="manual-laps-num">{i + 1}</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={lap.distanceKm}
              onChange={(e) => updateLap(i, 'distanceKm', e.target.value)}
            />
            <input
              type="number"
              min={0}
              value={lap.durationM}
              onChange={(e) => updateLap(i, 'durationM', e.target.value)}
            />
            <input
              type="number"
              min={0}
              max={59}
              value={lap.durationS}
              onChange={(e) => updateLap(i, 'durationS', e.target.value)}
            />
            <input
              type="number"
              min={0}
              value={lap.avgHeartRate}
              onChange={(e) => updateLap(i, 'avgHeartRate', e.target.value)}
            />
            <input
              type="number"
              min={0}
              value={lap.avgPitchSpm}
              onChange={(e) => updateLap(i, 'avgPitchSpm', e.target.value)}
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={lap.avgStrideM}
              onChange={(e) => updateLap(i, 'avgStrideM', e.target.value)}
            />
            <button
              type="button"
              className="manual-laps-remove"
              onClick={() => removeLap(i)}
              disabled={laps.length === 1}
              title="このラップを削除"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="manual-laps-add" onClick={addLap}>
        + ラップを追加
      </button>
    </fieldset>
  );
}
