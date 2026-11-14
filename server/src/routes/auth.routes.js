import bcrypt from 'bcryptjs';
import { Router } from 'express';
import mongoose from 'mongoose';

import { requireAuth, signToken } from '../lib/auth.js';
import { markUserActive } from '../lib/streak.js';
import { User } from '../models/User.js';

const router = Router();

function createSessionPayload(user, token) {
  return {
    ...(token ? { token } : {}),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      goals: user.goals,
      subscription: user.subscription,
      points: user.points,
    },
  };
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: 'Email is already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash });

  const token = signToken(user.id);
  return res.status(201).json(createSessionPayload(user, token));
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash || ''))) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  await markUserActive(user);
  const token = signToken(user.id);
  return res.json(createSessionPayload(user, token));
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  await markUserActive(user);
  return res.json(createSessionPayload(user));
});

router.put('/profile', requireAuth, async (req, res) => {
  const { name } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'A valid name is required.' });
  }

  const user = await User.findByIdAndUpdate(req.userId, { name: name.trim() }, { new: true });
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  return res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

router.put('/goals', requireAuth, async (req, res) => {
  const { calories, protein, carbs, fat } = req.body || {};
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const pick = (value, current, min, max) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= min && numeric <= max ? Math.round(numeric) : current;
  };

  user.goals = {
    calories: pick(calories, user.goals?.calories ?? 2000, 800, 6000),
    protein: pick(protein, user.goals?.protein ?? 120, 10, 500),
    carbs: pick(carbs, user.goals?.carbs ?? 250, 10, 800),
    fat: pick(fat, user.goals?.fat ?? 70, 5, 300),
  };
  await user.save();

  return res.json({ goals: user.goals });
});

router.get('/stats', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const Recipe = (await import('../models/Recipe.js')).Recipe;
  const recipesCount = await Recipe.countDocuments({ userId: user.id });
  const groupsCount = await (await import('../models/Group.js')).Group.countDocuments({
    members: req.userId,
  });

  return res.json({
    stats: {
      streak: user.streak?.current || 0,
      recipes: recipesCount,
      points: user.points || 0,
      groups: groupsCount,
      totalRecipesCooked: user.totalRecipesCooked || 0,
      memberSince: user.createdAt,
    },
    goals: user.goals,
    subscription: user.subscription,
  });
});

export default router;
