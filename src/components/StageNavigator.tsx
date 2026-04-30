import type { StageNumber } from '../templates/types';

type Props = {
  currentStage: StageNumber;
  canGoNext: boolean;
  missingFields: string[];
  onPrev: () => void;
  onNext: () => void;
  onSelect: (stage: StageNumber) => void;
};

const STAGES: { value: StageNumber; label: string }[] = [
  { value: 1, label: 'Stage 1: 分析' },
  { value: 2, label: 'Stage 2: 手法比較' },
  { value: 3, label: 'Stage 3: スケジュール' },
];

export default function StageNavigator({
  currentStage,
  canGoNext,
  missingFields,
  onPrev,
  onNext,
  onSelect,
}: Props) {
  const isLast = currentStage === 3;
  const isFirst = currentStage === 1;

  return (
    <div className="stage-nav">
      <div className="stage-nav-bar">
        {STAGES.map((s, i) => (
          <button
            key={s.value}
            type="button"
            className={`stage-nav-dot${currentStage === s.value ? ' is-active' : ''}${
              s.value < currentStage ? ' is-done' : ''
            }`}
            onClick={() => onSelect(s.value)}
            disabled={s.value > currentStage && !canGoNext}
          >
            <span className="stage-nav-dot-num">{i + 1}</span>
            <span className="stage-nav-dot-label">{s.label}</span>
          </button>
        ))}
      </div>
      <p className="stage-nav-recommend">
        このアプリは Gemini での使用を推奨します。ChatGPT や Claude でも動作しますが、出力品質は保証されません。
      </p>
      <div className="stage-nav-controls">
        <button type="button" onClick={onPrev} disabled={isFirst}>
          ← 前のステージへ
        </button>
        <button type="button" onClick={onNext} disabled={isLast || !canGoNext}>
          次のステージへ →
        </button>
      </div>
      {!canGoNext && !isLast && missingFields.length > 0 && (
        <p className="stage-nav-missing">
          次へ進むには以下を入力してください: {missingFields.join('、')}
        </p>
      )}
    </div>
  );
}
