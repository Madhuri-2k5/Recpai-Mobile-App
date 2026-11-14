import { Router } from 'express';

import { requireAuth } from '../lib/auth.js';
import { buildStreakPayload, MILESTONES } from '../lib/streak.js';
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

router.post('/claim', requireAuth, async (req, res) => {
  const { days } = req.body || {};
  const milestoneDays = Number(days);
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const milestone = MILESTONES.find((m) => m.days === milestoneDays);
  if (!milestone) {
    return res.status(400).json({ message: 'Invalid milestone.' });
  }

  const currentStreak = user.streak?.current || 0;
  if (currentStreak < milestone.days) {
    return res.status(400).json({ message: 'Milestone not yet reached.' });
  }

  user.claimedMilestones = user.claimedMilestones || [];
  if (user.claimedMilestones.map(Number).includes(milestone.days)) {
    return res.status(400).json({ message: 'Reward already claimed.' });
  }

  user.claimedMilestones.push(milestone.days);

  let rewardMessage = '';
  if (milestone.days === 7) {
    user.points = (user.points || 0) + 200;
    rewardMessage = 'Claimed 200 points and Week Warrior badge!';
  } else if (milestone.days === 30) {
    const renewsAt = new Date();
    renewsAt.setDate(renewsAt.getDate() + 30);
    user.subscription = {
      plan: 'monthly',
      startedAt: new Date(),
      renewsAt,
    };
    user.points = (user.points || 0) + 500;
    rewardMessage = 'Unlocked 1 month of Free Premium and 500 points!';
  } else if (milestone.days === 60) {
    user.points = (user.points || 0) + 1000;
    rewardMessage = 'Claimed 1,000 points and Two-Month Legend exclusive avatar!';
  }

  await user.save();
  const streak = await buildStreakPayload(user);
  return res.json({
    streak,
    user: {
      id: user.id,
      points: user.points,
      subscription: user.subscription,
    },
    message: rewardMessage,
  });
});

export default router;
