import { Router } from 'express';

import { requireAuth } from '../lib/auth.js';
import { todayDateString } from '../lib/streak.js';
import { DailyLog } from '../models/DailyLog.js';
import { User } from '../models/User.js';

const router = Router();

router.get('/summary', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const targetDateStr =
    typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : todayDateString();

  const targetDate = new Date(`${targetDateStr}T12:00:00`);
  const dates = Array.from({ length: 7 }, (_, index) => {
    const d = new Date(targetDate);
    d.setDate(d.getDate() - (6 - index));
    return d.toISOString().slice(0, 10);
  });

  const logs = await DailyLog.find({ userId: req.userId, date: { $in: dates } });
  const logByDate = new Map(logs.map((log) => [log.date, log]));

  const week = dates.map((date) => {
    const totals = logByDate.get(date)?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    return {
      date,
      day: new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
    };
  });

  const targetTotals = logByDate.get(targetDateStr)?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return res.json({
    today: { date: targetDateStr, ...targetTotals },
    week,
    targets: user.goals,
  });
});

export default router;
