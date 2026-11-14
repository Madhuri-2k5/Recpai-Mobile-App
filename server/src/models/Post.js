import mongoose from 'mongoose';
import { isMongoActive } from '../config/db.js';
import { createModelProxy, createStoreModel } from '../lib/storage.js';

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
    text: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

const MongoosePost = mongoose.model('Post', postSchema);
const StorePost = createStoreModel('posts', {
  group: null,
  recipe: null,
  text: '',
  image: '',
  likes: [],
  comments: [],
});

export const Post = createModelProxy(MongoosePost, StorePost, isMongoActive);
