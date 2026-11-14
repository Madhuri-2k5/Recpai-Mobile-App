import mongoose from 'mongoose';
import { isMongoActive } from '../config/db.js';
import { createModelProxy, createStoreModel } from '../lib/storage.js';

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: String, required: true },
  },
  { _id: false }
);

const nutritionSchema = new mongoose.Schema(
  {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    detectedItem: { type: String, default: '' },
    detectedItems: { type: [String], default: [] },
    title: { type: String, default: '' },
    category: { type: String, default: 'Recipe' },
    cuisine: { type: String, default: 'Indian' },
    dietGoal: { type: String, default: 'Balanced' },
    prepTimeMinutes: { type: Number, default: 20 },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    servings: { type: Number, default: 2 },
    summary: { type: String, default: '' },
    ingredients: { type: [ingredientSchema], default: [] },
    groceries: { type: [ingredientSchema], default: [] },
    steps: { type: [String], default: [] },
    tips: { type: [String], default: [] },
    nutrition: { type: nutritionSchema, default: () => ({}) },
    scanSummary: { type: String, default: '' },
    scanConfidence: { type: Number, default: 0 },
    scanWarnings: { type: [String], default: [] },
    nutritionSource: { type: String, default: 'gemini' },
    nutritionMatchedItems: { type: [String], default: [] },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const MongooseRecipe = mongoose.model('Recipe', recipeSchema);
const StoreRecipe = createStoreModel('recipes', {
  category: 'Recipe',
  cuisine: 'Indian',
  dietGoal: 'Balanced',
  prepTimeMinutes: 20,
  difficulty: 'Medium',
  servings: 2,
  ingredients: [],
  groceries: [],
  steps: [],
  tips: [],
  nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  imageUrl: '',
});

export const Recipe = createModelProxy(MongooseRecipe, StoreRecipe, isMongoActive);
