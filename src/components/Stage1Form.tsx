import type { GoalDistanceKey, RaceFormValues } from '../templates/types';

type Props = {
  values: RaceFormValues;
  onChange: (next: RaceFormValues) => void;
};

const GOAL_DISTANCE_OPTIONS: GoalDistanceKey[] = [
  '1500m',
  '3000m',
  '5000m',
  '10km',
  'ハーフ',
  'フル',
  'カスタム',
];

export default function Stage1Form({ values, onChange }: Props) {
  function update<K extends keyof RaceFormValues>(key: K, value: RaceFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <form className="race-form" onSubmit={(e) => e.preventDefault()}>
      <fieldset className="race-form-section">
        <legend>主目標（必須）</legend>
        <label className="race-form-row">
          <span>距離</span>
          <select
            value={values.goalDistance}
            onChange={(e) => update('goalDistance', e.target.value as GoalDistanceKey | '')}
          >
            <option value="">選択してください</option>
            {GOAL_DISTANCE_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        {values.goalDistance === 'カスタム' && (
          <label className="race-form-row">
            <span>カスタム距離</span>
            <input
              type="text"
              placeholder="例: 20km TT"
              value={values.goalDistanceCustom}
              onChange={(e) => update('goalDistanceCustom', e.target.value)}
            />
          </label>
        )}
        <div className="race-form-row">
          <span>目標タイム</span>
          <div className="race-form-time">
            <input
              type="number"
              min={0}
              placeholder="時"
              value={values.goalTimeH}
              onChange={(e) => update('goalTimeH', e.target.value)}
            />
            <span>:</span>
            <input
              type="number"
              min={0}
              max={59}
              placeholder="分"
              value={values.goalTimeM}
              onChange={(e) => update('goalTimeM', e.target.value)}
            />
            <span>:</span>
            <input
              type="number"
              min={0}
              max={59}
              placeholder="秒"
              value={values.goalTimeS}
              onChange={(e) => update('goalTimeS', e.target.value)}
            />
          </div>
        </div>
        <label className="race-form-row">
          <span>レース日</span>
          <input
            type="date"
            value={values.raceDate}
            onChange={(e) => update('raceDate', e.target.value)}
          />
        </label>
      </fieldset>

      <fieldset className="race-form-section">
        <legend>中間目標（任意）</legend>
        <label className="race-form-row">
          <span>距離</span>
          <select
            value={values.subGoalDistance}
            onChange={(e) => update('subGoalDistance', e.target.value as GoalDistanceKey | '')}
          >
            <option value="">選択しない</option>
            {GOAL_DISTANCE_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        {values.subGoalDistance === 'カスタム' && (
          <label className="race-form-row">
            <span>カスタム距離</span>
            <input
              type="text"
              placeholder="例: 20km TT"
              value={values.subGoalDistanceCustom}
              onChange={(e) => update('subGoalDistanceCustom', e.target.value)}
            />
          </label>
        )}
        <div className="race-form-row">
          <span>目標タイム</span>
          <div className="race-form-time">
            <input
              type="number"
              min={0}
              placeholder="時"
              value={values.subGoalTimeH}
              onChange={(e) => update('subGoalTimeH', e.target.value)}
            />
            <span>:</span>
            <input
              type="number"
              min={0}
              max={59}
              placeholder="分"
              value={values.subGoalTimeM}
              onChange={(e) => update('subGoalTimeM', e.target.value)}
            />
            <span>:</span>
            <input
              type="number"
              min={0}
              max={59}
              placeholder="秒"
              value={values.subGoalTimeS}
              onChange={(e) => update('subGoalTimeS', e.target.value)}
            />
          </div>
        </div>
        <label className="race-form-row">
          <span>レース日</span>
          <input
            type="date"
            value={values.subGoalDate}
            onChange={(e) => update('subGoalDate', e.target.value)}
          />
        </label>
      </fieldset>

      <fieldset className="race-form-section">
        <legend>ランナー情報（必須）</legend>
        <label className="race-form-row">
          <span>月間走行距離 (km)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={values.monthlyMileage}
            onChange={(e) => update('monthlyMileage', e.target.value)}
          />
        </label>
        <label className="race-form-row">
          <span>過去30日最長距離 (km)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={values.maxSingleRunDistance}
            onChange={(e) => update('maxSingleRunDistance', e.target.value)}
          />
        </label>
      </fieldset>
    </form>
  );
}
