# Nutri AI

Expo (React Native) app + Express/MongoDB backend.

```
mobile/   Expo app (expo-router, tab + stack navigation)
server/   Express + Mongoose API (port 2000)
```

## Backend

```bash
cd server
npm install
npm run dev        # http://localhost:2000
```

Requires MongoDB. Either start a local instance (`brew services start mongodb-community`)
or set `MONGODB_URI` in `server/.env` to a MongoDB Atlas connection string.

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
