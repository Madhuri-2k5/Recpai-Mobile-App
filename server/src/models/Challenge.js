import mongoose from 'mongoose';

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

export const Challenge = mongoose.model('Challenge', challengeSchema);
