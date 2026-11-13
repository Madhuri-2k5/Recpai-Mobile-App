import { Router } from 'express';

import { requireAuth } from '../lib/auth.js';
import { Recipe } from '../models/Recipe.js';

const router = Router();

function normalizeRecipeInput(input) {
  const safeArray = (value) => (Array.isArray(value) ? value : []);
  const toNumber = (value, fallback) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  };

  return {
    detectedItem: String(input?.detectedItem || '').trim(),
    detectedItems: safeArray(input?.detectedItems).map((item) => String(item).trim()).filter(Boolean),
    title: String(input?.title || '').trim() || 'Untitled Recipe',
    category: String(input?.category || '').trim() || 'Recipe',
    cuisine: String(input?.cuisine || '').trim() || 'Indian',
    dietGoal: String(input?.dietGoal || '').trim() || 'Balanced',
    prepTimeMinutes: Math.min(300, Math.max(1, toNumber(input?.prepTimeMinutes, 20))),
    difficulty: ['Easy', 'Medium', 'Hard'].includes(String(input?.difficulty))
      ? String(input.difficulty)
      : 'Medium',
    servings: Math.min(12, Math.max(1, toNumber(input?.servings, 2))),
    summary: String(input?.summary || '').trim(),
    ingredients: safeArray(input?.ingredients)
      .map((item) => ({ name: String(item?.name || '').trim(), quantity: String(item?.quantity || '').trim() }))
      .filter((item) => item.name),
    groceries: safeArray(input?.groceries)
      .map((item) => ({ name: String(item?.name || '').trim(), quantity: String(item?.quantity || '').trim() }))
      .filter((item) => item.name),
    steps: safeArray(input?.steps).map((step) => String(step).trim()).filter(Boolean),
    tips: safeArray(input?.tips).map((tip) => String(tip).trim()).filter(Boolean),
    nutrition: {
      calories: Math.max(0, toNumber(input?.nutrition?.calories, 0)),
      protein: Math.max(0, toNumber(input?.nutrition?.protein, 0)),
      carbs: Math.max(0, toNumber(input?.nutrition?.carbs, 0)),
      fat: Math.max(0, toNumber(input?.nutrition?.fat, 0)),
      fiber: Math.max(0, toNumber(input?.nutrition?.fiber, 0)),
    },
    scanSummary: String(input?.scanSummary || '').trim(),
    scanConfidence: Math.min(1, Math.max(0, toNumber(input?.scanConfidence, 0))),
    scanWarnings: safeArray(input?.scanWarnings).map((item) => String(item).trim()).filter(Boolean),
    nutritionSource: String(input?.nutritionSource || 'gemini').trim(),
    nutritionMatchedItems: safeArray(input?.nutritionMatchedItems).map((item) => String(item).trim()),
    imageUrl: String(input?.imageUrl || '').trim(),
  };
}

router.post('/', requireAuth, async (req, res) => {
  const payload = normalizeRecipeInput(req.body?.recipe || req.body);
  if (!payload.title || payload.ingredients.length === 0) {
    return res.status(400).json({ message: 'Recipe title and ingredients are required.' });
  }

  const recipe = await Recipe.create({ ...payload, userId: req.userId });
  return res.status(201).json({ recipe });
});

router.get('/', requireAuth, async (req, res) => {
  const recipes = await Recipe.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
  return res.json({ recipes });
});

router.get('/:id', requireAuth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) {
    return res.status(404).json({ message: 'Recipe not found.' });
  }
  return res.json({ recipe });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!recipe) {
    return res.status(404).json({ message: 'Recipe not found.' });
  }
  return res.json({ ok: true });
});

export default router;
