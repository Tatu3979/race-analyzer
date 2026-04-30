export type StageNumber = 1 | 2 | 3;

export type Category = 'LT2' | 'VO2max' | 'スピード' | '持久力';

export type Phase = '基礎期' | 'ビルド期' | '特異期' | 'テーパリング期';

export type PeriodMode = '短期' | '中期' | '長期';

export type Achievability = '達成可能' | '達成困難' | '現実性が低い';

export type SubGoalPositioning =
  | '中間目標なし'
  | '練習の一環（テーパーなし）'
  | '戦術確認の場（軽いテーパー）'
  | '本命として狙う（ミニテーパー＋回復）';

export type GoalDistanceKey =
  | '1500m'
  | '3000m'
  | '5000m'
  | '10km'
  | 'ハーフ'
  | 'フル'
  | 'カスタム';

export type RaceFormValues = {
  goalDistance: GoalDistanceKey | '';
  goalDistanceCustom: string;
  goalTime: string;
  raceDate: string;
  monthlyMileage: string;
  maxSingleRunDistance: string;
  subGoalDistance: GoalDistanceKey | '';
  subGoalDistanceCustom: string;
  subGoalTime: string;
  subGoalDate: string;
};

export type Stage1to2Values = {
  strengthCategory: Category | '';
  weaknessCategory: Category | '';
  phase1Weeks: string;
  phase2Weeks: string;
  phase3Weeks: string;
  phase4Weeks: string;
  currentPhase: Phase | '';
  subGoalPositioning: SubGoalPositioning | '';
  achievabilityEvaluation: Achievability | '';
};

export const emptyRaceForm: RaceFormValues = {
  goalDistance: '',
  goalDistanceCustom: '',
  goalTime: '',
  raceDate: '',
  monthlyMileage: '',
  maxSingleRunDistance: '',
  subGoalDistance: '',
  subGoalDistanceCustom: '',
  subGoalTime: '',
  subGoalDate: '',
};

export const emptyStage1to2: Stage1to2Values = {
  strengthCategory: '',
  weaknessCategory: '',
  phase1Weeks: '',
  phase2Weeks: '',
  phase3Weeks: '',
  phase4Weeks: '',
  currentPhase: '',
  subGoalPositioning: '',
  achievabilityEvaluation: '',
};
