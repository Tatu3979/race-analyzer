export type StageNumber = 1 | 2 | 3;

export type PeriodMode = '短期' | '中期' | '長期';

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
  goalTimeH: string;
  goalTimeM: string;
  goalTimeS: string;
  raceDate: string;
  monthlyMileage: string;
  maxSingleRunDistance: string;
  maxHr: string;
  subGoalDistance: GoalDistanceKey | '';
  subGoalDistanceCustom: string;
  subGoalTimeH: string;
  subGoalTimeM: string;
  subGoalTimeS: string;
  subGoalDate: string;
};

export const emptyRaceForm: RaceFormValues = {
  goalDistance: '',
  goalDistanceCustom: '',
  goalTimeH: '',
  goalTimeM: '',
  goalTimeS: '',
  raceDate: '',
  monthlyMileage: '',
  maxSingleRunDistance: '',
  maxHr: '',
  subGoalDistance: '',
  subGoalDistanceCustom: '',
  subGoalTimeH: '',
  subGoalTimeM: '',
  subGoalTimeS: '',
  subGoalDate: '',
};

