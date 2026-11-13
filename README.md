# Nutri AI (RecPAI 2.0)

AI-powered nutrition & recipe app. Expo (React Native) app + Express/MongoDB backend
with Gemini AI (food scan → recipe generation), Open Food Facts nutrition enrichment,
AI dish image generation, streaks, community groups and subscriptions.

```
mobile/   Expo app (expo-router, tabs + stack navigation, expo-camera scan flow)
server/   Express + Mongoose API (port 2000) — Gemini AI, JWT auth, DailyLog, Community
```

## Backend

```bash
cd server
npm install
npm run dev        # http://localhost:2000
```

Requires MongoDB. Either start a local instance (`brew services start mongodb-community`)
or set `MONGODB_URI` in `server/.env` to a MongoDB Atlas connection string.

`server/.env` keys:

```
PORT=2000
MONGODB_URI=...
CORS_ORIGIN=*
JWT_SECRET=...
GEMINI_API_KEY=...          # powers /api/ai/detect + /api/ai/recipe
GEMINI_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

### API overview

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PUT /api/auth/profile`, `PUT /api/auth/goals`, `GET /api/auth/stats` |
| AI | `POST /api/ai/detect` (food image validation), `POST /api/ai/recipe` (scan → recipe + groceries + nutrition + AI dish image) |
| Recipes | `POST /api/recipes`, `GET /api/recipes`, `GET /api/recipes/:id`, `DELETE /api/recipes/:id` |
| Meals | `POST /api/meals/log`, `GET /api/meals?date=` |
| Nutrition | `GET /api/nutrition/summary` (today + 7-day graph + targets) |
| Streak | `GET /api/streak` (streak, week check-ins, milestones) |
| Community | `GET/POST /api/community/posts`, `POST .../like`, `GET/POST /api/community/groups`, `POST .../share`, `GET /api/community/challenges`, `POST .../join`, `POST .../progress` |
| Subscription | `GET /api/subscription`, `POST /api/subscription/purchase`, `POST /api/subscription/cancel` |

All routes (except register/login/health) require a `Bearer` token.
Demo community content is seeded automatically on server start.

## Mobile

```bash
cd mobile
npm install
npm start          # press i (iOS), a (Android), or w (web)
```

The app reads the API URL from `mobile/.env` (`EXPO_PUBLIC_API_URL`):

- iOS simulator / web: `http://localhost:2000`
- Android emulator: `http://10.0.2.2:2000`
- Physical device: `http://<your-machine-lan-ip>:2000`

### App flow

1. **Auth gate** — email/password register & login (JWT stored in SecureStore).
2. **Home** — calorie ring, weekly intake bar chart (per-day calories/protein/carbs/fats), macro rings. Data from `GET /api/nutrition/summary`.
3. **Streak** — daily streak ring, week check-ins, milestone rewards (1 week / 1 month / 2 months), streak stats.
4. **Scan** — camera (PhonePe-style scanner). Capture → cuisine style + servings → AI generates the recipe (estimated time, groceries list, ingredients with quantities, process steps) → **Add to My Meals** saves the recipe and logs it to the daily graph + streak.
5. **Community** — feed (posts, likes), challenges (join + daily progress), groups (create Friends/Family groups, share recipes), your recipe history.
6. **Profile & Subscription** — stats, editable nutrition goals, Free/Premium (monthly/yearly) mock purchase.
