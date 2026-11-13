export type NutrientKey = 'calories' | 'protein' | 'carbs' | 'fats';

export type NavIconName = 'home' | 'streak' | 'scan' | 'community' | 'profile';

export interface NavItem {
  key: NavIconName;
  route: '/' | '/streak' | '/scan' | '/community' | '/profile';
  label: string;
  icon: NavIconName;
}

export interface NutrientStat {
  key: NutrientKey;
  label: string;
  consumed: number;
  target: number;
  unit: string;
  ringColors: [string, string];
}

export interface WeeklySeries {
  key: NutrientKey;
  unit: string;
  max: number;
  step: number;
  values: number[];
  labels?: string[];
}

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const nutrientOrder: NutrientKey[] = ['calories', 'protein', 'carbs', 'fats'];

export const macroKeys: NutrientKey[] = ['protein', 'carbs', 'fats'];

export const calorieRingSegments = {
  blueShare: 0.394,
  greenShare: 0.212,
  purpleShare: 0.394,
  coloredSpan: 0.918,
} as const;

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
