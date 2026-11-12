import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import healthRoutes from './routes/health.routes.js';
import foodRoutes from './routes/food.routes.js';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : '*';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/foods', foodRoutes);

const PORT = process.env.PORT || 2000;

connectDB();

app.listen(PORT, () => {
  console.log(`Nutri AI server running on port ${PORT}`);
});