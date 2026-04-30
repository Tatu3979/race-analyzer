import type {
  Achievability,
  Category,
  Phase,
  PeriodMode,
  Stage1to2Values,
  SubGoalPositioning,
} from '../templates/types';

type Props = {
  values: Stage1to2Values;
  onChange: (next: Stage1to2Values) => void;
  periodMode: PeriodMode;
};

const CATEGORY_OPTIONS: Category[] = ['LT2', 'VO2max', 'スピード', '持久力'];

const PHASE_OPTIONS: Phase[] = ['基礎期', 'ビルド期', '特異期', 'テーパリング期'];

const SUB_GOAL_POSITIONING_OPTIONS: SubGoalPositioning[] = [
  '中間目標なし',
  '練習の一環（テーパーなし）',
  '戦術確認の場（軽いテーパー）',
  '本命として狙う（ミニテーパー＋回復）',
];

const ACHIEVABILITY_OPTIONS: Achievability[] = ['達成可能', '達成困難', '現実性が低い'];

export default function Stage2Bridge({ values, onChange, periodMode }: Props) {
  function update<K extends keyof Stage1to2Values>(key: K, value: Stage1to2Values[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <form className="bridge-form" onSubmit={(e) => e.preventDefault()}>
      <p className="bridge-form-guide">
        Stage 1 のプロンプトを AI（Gemini 推奨）に投げ、出力を見ながら以下を選択してください。
      </p>

      <fieldset className="race-form-section">
        <legend>分析結果（必須）</legend>
        <label className="race-form-row">
          <span>得意分野</span>
          <select
            value={values.strengthCategory}
            onChange={(e) => update('strengthCategory', e.target.value as Category | '')}
          >
            <option value="">選択してください</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="race-form-row">
          <span>重点的に取り組む弱点</span>
          <select
            value={values.weaknessCategory}
            onChange={(e) => update('weaknessCategory', e.target.value as Category | '')}
          >
            <option value="">選択してください</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="race-form-row">
          <span>達成可能性評価</span>
          <select
            value={values.achievabilityEvaluation}
            onChange={(e) =>
              update('achievabilityEvaluation', e.target.value as Achievability | '')
            }
          >
            <option value="">選択してください</option>
            {ACHIEVABILITY_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="race-form-row">
          <span>中間目標の位置づけ</span>
          <select
            value={values.subGoalPositioning}
            onChange={(e) =>
              update('subGoalPositioning', e.target.value as SubGoalPositioning | '')
            }
          >
            <option value="">選択してください</option>
            {SUB_GOAL_POSITIONING_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <fieldset className="race-form-section">
        <legend>フェーズ設定（必須）</legend>
        <label className="race-form-row">
          <span>現在のフェーズ</span>
          <select
            value={values.currentPhase}
            onChange={(e) => update('currentPhase', e.target.value as Phase | '')}
          >
            <option value="">選択してください</option>
            {PHASE_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        {periodMode === '長期' && (
          <>
            <p className="bridge-form-note">
              4 フェーズ配分（自動算出値、必要なら微調整）
            </p>
            <label className="race-form-row">
              <span>基礎期 (週)</span>
              <input
                type="number"
                min={0}
                value={values.phase1Weeks}
                onChange={(e) => update('phase1Weeks', e.target.value)}
              />
            </label>
            <label className="race-form-row">
              <span>ビルド期 (週)</span>
              <input
                type="number"
                min={0}
                value={values.phase2Weeks}
                onChange={(e) => update('phase2Weeks', e.target.value)}
              />
            </label>
            <label className="race-form-row">
              <span>特異期 (週)</span>
              <input
                type="number"
                min={0}
                value={values.phase3Weeks}
                onChange={(e) => update('phase3Weeks', e.target.value)}
              />
            </label>
            <label className="race-form-row">
              <span>テーパリング期 (週)</span>
              <input
                type="number"
                min={0}
                value={values.phase4Weeks}
                onChange={(e) => update('phase4Weeks', e.target.value)}
              />
            </label>
          </>
        )}
      </fieldset>
    </form>
  );
}
