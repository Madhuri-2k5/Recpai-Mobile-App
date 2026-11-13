import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './config/db.js';
import aiRoutes from './routes/ai.routes.js';
import authRoutes from './routes/auth.routes.js';
import communityRoutes from './routes/community.routes.js';
import healthRoutes from './routes/health.routes.js';
import mealsRoutes from './routes/meals.routes.js';
import nutritionRoutes from './routes/nutrition.routes.js';
import recipesRoutes from './routes/recipes.routes.js';
import streakRoutes from './routes/streak.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import { seedDemoData } from './lib/seed.js';

const app = express();

const corsOrigin = (process.env.CORS_ORIGIN ?? '*').trim();
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((o) => o.trim()),
  })
);
app.use(express.json({ limit: '12mb' }));

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/subscription', subscriptionRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Unexpected server error.' });
});

const PORT = process.env.PORT || 2000;

async function start() {
  await connectDB();
  await seedDemoData();
  app.listen(PORT, () => {
    console.log(`Nutri AI server running on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
