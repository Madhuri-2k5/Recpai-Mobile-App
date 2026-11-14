import mongoose from 'mongoose';
import { isMongoActive } from '../config/db.js';
import { createModelProxy, createStoreModel } from '../lib/storage.js';

const mealSchema = new mongoose.Schema(
  {
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
    title: { type: String, default: '' },
    cuisine: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    servings: { type: Number, default: 1 },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const dailyLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    meals: { type: [mealSchema], default: [] },
  },
  { timestamps: true }
);

dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

dailyLogSchema.virtual('totals').get(function () {
  return (this.meals || []).reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
});

dailyLogSchema.set('toJSON', { virtuals: true });

const MongooseDailyLog = mongoose.model('DailyLog', dailyLogSchema);
const StoreDailyLog = createStoreModel('dailyLogs', {
  meals: [],
});

export const DailyLog = createModelProxy(MongooseDailyLog, StoreDailyLog, isMongoActive);
