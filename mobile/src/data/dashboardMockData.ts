export type NutrientKey = 'calories' | 'protein' | 'carbs' | 'fats';

export type NavIconName = 'home' | 'streak' | 'scan' | 'community' | 'profile';

export interface NavItem {
  key: NavIconName;
  route: '/' | '/streak' | '/scan' | '/community' | '/profile';
  label: string;
  icon: NavIconName;
}

export interface UserProfile {
  name: string;
  greeting: string;
  avatar: number;
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
}

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export const DEFAULT_DATE = new Date(2026, 3, 26);

export const user: UserProfile = {
  name: 'Sarah',
  greeting: 'Good morning,',
  avatar: require('@/assets/images/avatar.jpg'),
};

export const nutritionStats: Record<NutrientKey, NutrientStat> = {
  calories: {
    key: 'calories',
    label: 'Calories',
    consumed: 1248,
    target: 2000,
    unit: 'kcal',
    ringColors: ['#B74FF5', '#753AFF'],
  },
  protein: {
    key: 'protein',
    label: 'Protein',
    consumed: 82,
    target: 120,
    unit: 'g',
    ringColors: ['#00D58A', '#00D7C5'],
  },
  carbs: {
    key: 'carbs',
    label: 'Carbs',
    consumed: 124,
    target: 250,
    unit: 'g',
    ringColors: ['#00D7C5', '#38E5FF'],
  },
  fats: {
    key: 'fats',
    label: 'Fats',
    consumed: 42,
    target: 70,
    unit: 'g',
    ringColors: ['#FFAC38', '#FFC46B'],
  },
};

export const nutrientOrder: NutrientKey[] = ['calories', 'protein', 'carbs', 'fats'];

export const macroKeys: NutrientKey[] = ['protein', 'carbs', 'fats'];

export const weeklySeries: Record<NutrientKey, WeeklySeries> = {
  calories: {
    key: 'calories',
    unit: 'kcal',
    max: 2000,
    step: 500,
    values: [650, 1000, 1100, 1250, 1500, 1050, 800],
  },
  protein: {
    key: 'protein',
    unit: 'g',
    max: 150,
    step: 50,
    values: [52, 71, 64, 88, 96, 78, 82],
  },
  carbs: {
    key: 'carbs',
    unit: 'g',
    max: 250,
    step: 50,
    values: [88, 150, 176, 132, 198, 160, 124],
  },
  fats: {
    key: 'fats',
    unit: 'g',
    max: 75,
    step: 25,
    values: [24, 38, 31, 45, 52, 36, 42],
  },
};

export const calorieRingSegments = {
  blueShare: 0.394,
  greenShare: 0.212,
  purpleShare: 0.394,
  coloredSpan: 0.918,
} as const;

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
