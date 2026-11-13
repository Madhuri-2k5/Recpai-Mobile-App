import { DailyLog } from '../models/DailyLog.js';

export const MILESTONES = [
  { days: 7, name: 'Week Warrior', reward: 'Consistency badge + 200 pts' },
  { days: 30, name: 'Month Master', reward: '1 month of Premium free' },
  { days: 60, name: 'Two-Month Legend', reward: 'Exclusive avatar + 1000 pts' },
];

export function todayDateString(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function dayLabel(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
}

export async function markUserActive(user) {
  const today = todayDateString();

  const logs = await DailyLog.find({ userId: user.id, 'meals.0': { $exists: true } })
    .sort({ date: -1 })
    .limit(400)
    .select('date');
  const mealDays = new Set(logs.map((log) => log.date));

  let current = 0;
  const cursor = new Date();
  if (!mealDays.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (mealDays.has(cursor.toISOString().slice(0, 10))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  if (current === 0 && user.streak?.lastActiveDate) {
    const yesterday = todayDateString(-1);
    current =
      user.streak.lastActiveDate === today
        ? user.streak.current || 1
        : user.streak.lastActiveDate === yesterday
          ? (user.streak.current || 0) + 1
          : 1;
  }
  if (current === 0) {
    current = 1;
  }

  user.streak = {
    current,
    longest: Math.max(user.streak?.longest || 0, current),
    lastActiveDate: today,
  };
  await user.save();
  return user.streak;
}

export async function buildStreakPayload(user) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date.toISOString().slice(0, 10);
  });

  const logs = await DailyLog.find({
    userId: user.id,
    date: { $in: weekDates },
    'meals.0': { $exists: true },
  }).select('date');

  const activeDates = new Set(logs.map((log) => log.date));
  const today = todayDateString();

  const week = weekDates.map((date, index) => ({
    day: dayLabel(date),
    done: activeDates.has(date) || (date === today && user.streak?.lastActiveDate === today),
    isToday: date === today,
  }));

  const current = user.streak?.current || 0;
  const nextMilestone = MILESTONES.find((milestone) => milestone.days > current);

  const milestones = MILESTONES.map((milestone) => ({
    ...milestone,
    status:
      current >= milestone.days ? 'completed' : milestone === nextMilestone ? 'in-progress' : 'locked',
  }));

  return {
    current,
    longest: user.streak?.longest || 0,
    totalRecipesCooked: user.totalRecipesCooked || 0,
    points: user.points || 0,
    week,
    milestones,
    daysToNextMilestone: nextMilestone ? nextMilestone.days - current : 0,
  };
}
