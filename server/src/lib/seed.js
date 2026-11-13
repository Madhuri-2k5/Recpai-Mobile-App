import bcrypt from 'bcryptjs';

import { Challenge } from '../models/Challenge.js';
import { Group } from '../models/Group.js';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';

const CHALLENGES = [
  {
    key: '7-day-healthy-cooking',
    name: '7-Day Healthy Cooking Challenge',
    description: 'Cook one healthy home-made meal every day for a week.',
    days: 7,
    reward: 'Challenge badge + 200 points',
  },
  {
    key: '30-day-protein-power',
    name: '30-Day Protein Power',
    description: 'Hit your daily protein target for 30 days straight.',
    days: 30,
    reward: 'Premium month + exclusive badge',
  },
  {
    key: 'meatless-mondays',
    name: 'Meatless Mondays',
    description: 'Go plant-based every Monday for a month.',
    days: 28,
    reward: 'Recipe book discount',
  },
];

const DEMO_USERS = [
  { name: 'HealthyFoodie', email: 'healthyfoodie@demo.recpai', text: 'Loving this high-protein breakfast!\n5 ingredients, 15 minutes and 32g of protein 💜' },
  { name: 'FitChefAnna', email: 'fitchefanna@demo.recpai', text: 'Just completed the 7-day healthy cooking challenge! Feeling amazing 🙌' },
  { name: 'MealPrepMax', email: 'mealprepmax@demo.recpai', text: 'Sunday meal prep done — 5 lunches under 500 kcal each. Scan. Cook. Repeat.' },
];

export async function seedDemoData() {
  for (const challenge of CHALLENGES) {
    await Challenge.updateOne({ key: challenge.key }, challenge, { upsert: true });
  }

  const existingPosts = await Post.countDocuments({ group: null });
  if (existingPosts > 0) {
    return;
  }

  const demoPasswordHash = await bcrypt.hash('password123', 10);
  const users = [];

  for (const demo of DEMO_USERS) {
    let user = await User.findOne({ email: demo.email });
    if (!user) {
      user = await User.create({
        name: demo.name,
        email: demo.email,
        passwordHash: demoPasswordHash,
        points: 450,
        streak: { current: 5, longest: 12, lastActiveDate: new Date().toISOString().slice(0, 10) },
        totalRecipesCooked: 14,
      });
    }
    users.push({ user, text: demo.text });
  }

  for (const entry of users) {
    await Post.create({ user: entry.user.id, text: entry.text, likes: [] });
  }

  const owner = users[0].user;
  const existingGroup = await Group.findOne({ name: 'Foodies Club' });
  if (!existingGroup) {
    await Group.create({
      name: 'Foodies Club',
      kind: 'Friends',
      owner: owner.id,
      members: users.map((entry) => entry.user.id),
    });
  }

  console.log('[seed] demo community data ready');
}
