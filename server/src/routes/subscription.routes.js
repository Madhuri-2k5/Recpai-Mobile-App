import { Router } from 'express';

import { requireAuth } from '../lib/auth.js';
import { User } from '../models/User.js';

const router = Router();

const PLANS = {
  monthly: { label: 'Monthly', price: '$9.99', days: 30 },
  yearly: { label: 'Yearly', price: '$79.99', days: 365 },
};

router.get('/', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }
  return res.json({ subscription: user.subscription, plans: PLANS });
});

router.post('/purchase', requireAuth, async (req, res) => {
  const { plan } = req.body || {};
  const selected = PLANS[plan];

  if (!selected) {
    return res.status(400).json({ message: 'Plan must be monthly or yearly.' });
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const renewsAt = new Date();
  renewsAt.setDate(renewsAt.getDate() + selected.days);

  user.subscription = {
    plan,
    startedAt: new Date(),
    renewsAt,
  };
  user.points = (user.points || 0) + 100;
  await user.save();

  return res.json({ subscription: user.subscription, points: user.points });
});

router.post('/cancel', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  user.subscription = { plan: 'free', startedAt: undefined, renewsAt: undefined };
  await user.save();

  return res.json({ subscription: user.subscription });
});

export default router;
