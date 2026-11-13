import { Router } from 'express';
import mongoose from 'mongoose';

import { requireAuth } from '../lib/auth.js';
import { Challenge } from '../models/Challenge.js';
import { Group } from '../models/Group.js';
import { Post } from '../models/Post.js';
import { Recipe } from '../models/Recipe.js';
import { User } from '../models/User.js';

const router = Router();

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

async function serializePosts(posts, viewerId) {
  return posts.map((post) => {
    const user = post.user;
    return {
      id: post.id,
      user: { id: user.id, name: user.name },
      groupId: post.group?.id || null,
      groupName: post.group?.name || null,
      text: post.text,
      image: post.image,
      recipe: post.recipe
        ? {
            id: post.recipe.id,
            title: post.recipe.title,
            imageUrl: post.recipe.imageUrl,
            kcal: post.recipe.nutrition?.calories || 0,
          }
        : null,
      likes: post.likes.length,
      likedByMe: post.likes.some((like) => String(like) === String(viewerId)),
      comments: post.comments.length,
      createdAt: post.createdAt,
      timeAgo: timeAgo(post.createdAt),
    };
  });
}

router.get('/posts', requireAuth, async (req, res) => {
  const filter = {};
  if (typeof req.query.groupId === 'string' && req.query.groupId) {
    filter.group = req.query.groupId;
  }

  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('user', 'name')
    .populate('group', 'name')
    .populate('recipe', 'title imageUrl nutrition');

  return res.json({ posts: await serializePosts(posts, req.userId) });
});

router.post('/posts', requireAuth, async (req, res) => {
  const { text, groupId, recipeId, image } = req.body || {};

  if (!text && !recipeId && !image) {
    return res.status(400).json({ message: 'Post needs text, an image, or a recipe.' });
  }

  const post = await Post.create({
    user: req.userId,
    group: groupId || null,
    recipe: recipeId || null,
    text: String(text || '').trim(),
    image: String(image || '').trim(),
  });

  const populated = await Post.findById(post.id)
    .populate('user', 'name')
    .populate('group', 'name')
    .populate('recipe', 'title imageUrl nutrition');

  return res.status(201).json({ post: (await serializePosts([populated], req.userId))[0] });
});

router.post('/posts/:id/like', requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  const viewerId = new mongoose.Types.ObjectId(req.userId);
  const liked = post.likes.some((like) => String(like) === String(req.userId));

  if (liked) {
    post.likes = post.likes.filter((like) => String(like) !== String(req.userId));
  } else {
    post.likes.push(viewerId);
  }
  await post.save();

  return res.json({ likes: post.likes.length, likedByMe: !liked });
});

router.post('/posts/:id/comments', requireAuth, async (req, res) => {
  const { text } = req.body || {};
  if (!text || !String(text).trim()) {
    return res.status(400).json({ message: 'Comment text is required.' });
  }

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: { user: req.userId, text: String(text).trim() } } },
    { new: true }
  );
  if (!post) {
    return res.status(404).json({ message: 'Post not found.' });
  }

  return res.status(201).json({ comments: post.comments.length });
});

router.get('/groups', requireAuth, async (req, res) => {
  const groups = await Group.find({ members: req.userId })
    .populate('members', 'name')
    .sort({ createdAt: -1 });

  const counts = await Post.aggregate([
    { $match: { group: { $in: groups.map((group) => group._id) } } },
    { $group: { _id: '$group', sharedRecipes: { $sum: 1 } } },
  ]);
  const countByGroup = new Map(counts.map((entry) => [String(entry._id), entry.sharedRecipes]));

  return res.json({
    groups: groups.map((group) => ({
      id: group.id,
      name: group.name,
      kind: group.kind,
      members: group.members.length,
      memberNames: group.members.map((member) => member.name).slice(0, 5),
      sharedRecipes: countByGroup.get(String(group._id)) || 0,
    })),
  });
});

router.post('/groups', requireAuth, async (req, res) => {
  const { name, kind } = req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: 'Group name is required.' });
  }

  const group = await Group.create({
    name: String(name).trim(),
    kind: kind === 'Family' ? 'Family' : 'Friends',
    owner: req.userId,
    members: [req.userId],
  });

  return res.status(201).json({
    group: {
      id: group.id,
      name: group.name,
      kind: group.kind,
      members: 1,
      memberNames: [],
      sharedRecipes: 0,
    },
  });
});

router.post('/groups/:id/share', requireAuth, async (req, res) => {
  const { recipeId, text } = req.body || {};

  const group = await Group.findOne({ _id: req.params.id, members: req.userId });
  if (!group) {
    return res.status(404).json({ message: 'Group not found.' });
  }

  const recipe = await Recipe.findOne({ _id: recipeId, userId: req.userId });
  if (!recipe) {
    return res.status(404).json({ message: 'Recipe not found.' });
  }

  const post = await Post.create({
    user: req.userId,
    group: group.id,
    recipe: recipe.id,
    text: String(text || `Shared a recipe: ${recipe.title}`).trim(),
  });

  const populated = await Post.findById(post.id)
    .populate('user', 'name')
    .populate('group', 'name')
    .populate('recipe', 'title imageUrl nutrition');

  return res.status(201).json({ post: (await serializePosts([populated], req.userId))[0] });
});

router.get('/challenges', requireAuth, async (req, res) => {
  const challenges = await Challenge.find().sort({ days: 1 });
  const user = await User.findById(req.userId);

  const counts = await User.aggregate([
    { $unwind: '$joinedChallenges' },
    { $group: { _id: '$joinedChallenges.challengeKey', participants: { $sum: 1 } } },
  ]);
  const countByKey = new Map(counts.map((entry) => [entry._id, entry.participants]));

  return res.json({
    challenges: challenges.map((challenge) => {
      const joined = user.joinedChallenges?.find((entry) => entry.challengeKey === challenge.key);
      return {
        key: challenge.key,
        name: challenge.name,
        description: challenge.description,
        days: challenge.days,
        reward: challenge.reward,
        participants: (countByKey.get(challenge.key) || 0) + 1,
        joined: Boolean(joined),
        progress: joined?.progress || 0,
        completed: Boolean(joined?.completed),
      };
    }),
  });
});

router.post('/challenges/:key/join', requireAuth, async (req, res) => {
  const challenge = await Challenge.findOne({ key: req.params.key });
  if (!challenge) {
    return res.status(404).json({ message: 'Challenge not found.' });
  }

  const user = await User.findById(req.userId);
  const joined = user.joinedChallenges?.find((entry) => entry.challengeKey === challenge.key);

  if (!joined) {
    user.joinedChallenges.push({ challengeKey: challenge.key, progress: 0, completed: false });
    await user.save();
  }

  return res.json({ joined: true, progress: joined?.progress || 0 });
});

router.post('/challenges/:key/progress', requireAuth, async (req, res) => {
  const challenge = await Challenge.findOne({ key: req.params.key });
  if (!challenge) {
    return res.status(404).json({ message: 'Challenge not found.' });
  }

  const user = await User.findById(req.userId);
  const joined = user.joinedChallenges?.find((entry) => entry.challengeKey === challenge.key);

  if (!joined) {
    return res.status(400).json({ message: 'Join the challenge first.' });
  }
  if (joined.completed) {
    return res.json({ progress: joined.progress, completed: true });
  }

  joined.progress = Math.min(challenge.days, joined.progress + 1);
  if (joined.progress >= challenge.days) {
    joined.completed = true;
    user.points = (user.points || 0) + 200;
  }
  await user.save();

  return res.json({ progress: joined.progress, completed: joined.completed, points: user.points });
});

export default router;
