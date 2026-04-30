import type { SegmentSize } from '../utils/segment-analyzer';

type Props = {
  size: SegmentSize;
  onChange: (size: SegmentSize) => void;
};

const OPTIONS: { value: SegmentSize; label: string }[] = [
  { value: 200, label: '200m' },
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
];

export default function SegmentControls({ size, onChange }: Props) {
  return (
    <fieldset className="segment-controls">
      <legend>区間サイズ</legend>
      {OPTIONS.map((opt) => (
        <label key={opt.value} className="segment-controls-option">
          <input
            type="radio"
            name="segment-size"
            value={opt.value}
            checked={size === opt.value}
            onChange={() => onChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </fieldset>
  );
}
