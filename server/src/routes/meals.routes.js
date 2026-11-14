import { Router } from 'express';

import { requireAuth } from '../lib/auth.js';
import { markUserActive, todayDateString } from '../lib/streak.js';
import { DailyLog } from '../models/DailyLog.js';
import { Recipe } from '../models/Recipe.js';
import { User } from '../models/User.js';

const router = Router();

router.post('/log', requireAuth, async (req, res) => {
  const { recipeId, servings, date } = req.body || {};

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    return res.status(404).json({ message: 'Recipe not found.' });
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const portions = Math.min(12, Math.max(1, Number(servings) || recipe.servings || 1));
  const multiplier = portions / (recipe.servings || 1);

  const meal = {
    recipeId: recipe.id || recipe._id,
    title: recipe.title,
    cuisine: recipe.cuisine || 'Balanced',
    imageUrl: recipe.imageUrl || '',
    servings: portions,
    calories: Math.round((recipe.nutrition?.calories || 0) * multiplier),
    protein: Math.round((recipe.nutrition?.protein || 0) * multiplier),
    carbs: Math.round((recipe.nutrition?.carbs || 0) * multiplier),
    fat: Math.round((recipe.nutrition?.fat || 0) * multiplier),
    createdAt: new Date(),
  };

  const dateString = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayDateString();

  const log = await DailyLog.findOneAndUpdate(
    { userId: req.userId, date: dateString },
    { $push: { meals: meal } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  user.totalRecipesCooked = (user.totalRecipesCooked || 0) + 1;
  user.points = (user.points || 0) + 25;
  await user.save();
  await markUserActive(user);

  return res.status(201).json({ log, streak: user.streak, points: user.points });
});

router.get('/', requireAuth, async (req, res) => {
  const dateString =
    typeof req.query.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date)
      ? req.query.date
      : todayDateString();

  const log = await DailyLog.findOne({ userId: req.userId, date: dateString });
  return res.json({
    log: log || {
      date: dateString,
      meals: [],
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    },
  });
});

export default router;
