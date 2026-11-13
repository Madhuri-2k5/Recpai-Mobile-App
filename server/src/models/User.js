import mongoose from 'mongoose';

const goalsSchema = new mongoose.Schema(
  {
    calories: { type: Number, default: 2000 },
    protein: { type: Number, default: 120 },
    carbs: { type: Number, default: 250 },
    fat: { type: Number, default: 70 },
  },
  { _id: false }
);

const subscriptionSchema = new mongoose.Schema(
  {
    plan: { type: String, enum: ['free', 'monthly', 'yearly'], default: 'free' },
    startedAt: { type: Date },
    renewsAt: { type: Date },
  },
  { _id: false }
);

const streakSchema = new mongoose.Schema(
  {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: '' },
  },
  { _id: false }
);

const userChallengeSchema = new mongoose.Schema(
  {
    challengeKey: { type: String, required: true },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: '' },
    goals: { type: goalsSchema, default: () => ({}) },
    subscription: { type: subscriptionSchema, default: () => ({}) },
    streak: { type: streakSchema, default: () => ({}) },
    points: { type: Number, default: 0 },
    totalRecipesCooked: { type: Number, default: 0 },
    joinedChallenges: { type: [userChallengeSchema], default: [] },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
