import { Router } from 'express';

import { requireAuth } from '../lib/auth.js';
import { buildStreakPayload } from '../lib/streak.js';
import { User } from '../models/User.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const streak = await buildStreakPayload(user);
  return res.json({ streak });
});

export default router;
