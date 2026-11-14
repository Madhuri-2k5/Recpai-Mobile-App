import mongoose from 'mongoose';
import { isMongoActive } from '../config/db.js';
import { createModelProxy, createStoreModel } from '../lib/storage.js';

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    kind: { type: String, enum: ['Friends', 'Family'], default: 'Friends' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  { timestamps: true }
);

const MongooseGroup = mongoose.model('Group', groupSchema);
const StoreGroup = createStoreModel('groups', {
  kind: 'Friends',
  members: [],
});

export const Group = createModelProxy(MongooseGroup, StoreGroup, isMongoActive);
