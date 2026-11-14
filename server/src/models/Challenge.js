import mongoose from 'mongoose';
import { isMongoActive } from '../config/db.js';
import { createModelProxy, createStoreModel } from '../lib/storage.js';

const challengeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    days: { type: Number, required: true },
    reward: { type: String, default: '' },
  },
  { timestamps: true }
);

const MongooseChallenge = mongoose.model('Challenge', challengeSchema);
const StoreChallenge = createStoreModel('challenges', {
  description: '',
  reward: '',
});

export const Challenge = createModelProxy(MongooseChallenge, StoreChallenge, isMongoActive);
