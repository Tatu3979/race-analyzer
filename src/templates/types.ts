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
  goalTime: string;
  raceDate: string;
  monthlyMileage: string;
  maxSingleRunDistance: string;
  subGoalDistance: GoalDistanceKey | '';
  subGoalDistanceCustom: string;
  subGoalTime: string;
  subGoalDate: string;
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

