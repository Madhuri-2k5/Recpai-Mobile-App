import mongoose from 'mongoose';
import { loadStore } from '../lib/storage.js';

let mongoConnected = false;
let connectingPromise = null;

export function isMongoActive() {
  return mongoConnected && mongoose.connection?.readyState === 1;
}

const connectDB = async () => {
  if (mongoConnected && mongoose.connection?.readyState === 1) {
    return true;
  }
  if (connectingPromise) {
    return connectingPromise;
  }

  const uri = (process.env.MONGODB_URI || '').trim() || 'mongodb://127.0.0.1:27017/nutri-ai';
  connectingPromise = (async () => {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2000,
      });
      if (mongoose.connection?.readyState === 1) {
        mongoConnected = true;
        console.log(`[db] MongoDB connected: ${conn?.connection?.host || 'localhost'}/${conn?.connection?.name || 'nutri-ai'}`);
        return true;
      }
      throw new Error(`MongoDB connection readyState is ${mongoose.connection?.readyState}`);
    } catch (error) {
      mongoConnected = false;
      loadStore();
      console.log(`[db] MongoDB unavailable (${error.message}). Using embedded JSON database storage (server/data/store.json).`);
      return false;
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
};

export default connectDB;
