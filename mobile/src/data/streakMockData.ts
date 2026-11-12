export interface StreakDay {
  day: string;
  done: boolean;
  isToday: boolean;
}

export interface StreakMilestone {
  days: number;
  name: string;
  reward: string;
  status: 'completed' | 'in-progress' | 'locked';
}

export const streakStats = {
  currentStreak: 12,
  longestStreak: 28,
  totalRecipesCooked: 42,
  points: 8400,
};

export const streakWeek: StreakDay[] = [
  { day: 'Mon', done: true, isToday: false },
  { day: 'Tue', done: true, isToday: false },
  { day: 'Wed', done: true, isToday: false },
  { day: 'Thu', done: true, isToday: false },
  { day: 'Fri', done: true, isToday: false },
  { day: 'Sat', done: true, isToday: true },
  { day: 'Sun', done: false, isToday: false },
];

export const streakMilestones: StreakMilestone[] = [
  {
    days: 7,
    name: 'Week Warrior',
    reward: 'Consistency badge + 200 pts',
    status: 'completed',
  },
  {
    days: 30,
    name: 'Month Master',
    reward: '1 month of Premium free',
    status: 'in-progress',
  },
  {
    days: 60,
    name: 'Two-Month Legend',
    reward: 'Exclusive avatar + 1000 pts',
    status: 'locked',
  },
];

export const daysToNextMilestone = 3;
