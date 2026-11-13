import * as SecureStore from 'expo-secure-store';

const API_URL = `${(process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:2000').replace(/\/$/, '')}/api`;
const TOKEN_KEY = 'nutriai-token';

export interface Goals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Subscription {
  plan: 'free' | 'monthly' | 'yearly';
  startedAt?: string;
  renewsAt?: string;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  goals: Goals;
  subscription: Subscription;
  points: number;
}

export interface RecipeIngredient {
  name: string;
  quantity: string;
}

export interface RecipeNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Recipe {
  _id?: string;
  id?: string;
  detectedItem?: string;
  detectedItems?: string[];
  title: string;
  category?: string;
  cuisine: string;
  dietGoal?: string;
  prepTimeMinutes: number;
  difficulty?: string;
  servings: number;
  summary?: string;
  ingredients: RecipeIngredient[];
  groceries: RecipeIngredient[];
  steps: string[];
  tips?: string[];
  nutrition: RecipeNutrition;
  scanSummary?: string;
  scanConfidence?: number;
  scanWarnings?: string[];
  nutritionSource?: string;
  nutritionMatchedItems?: string[];
  imageUrl: string;
  createdAt?: string;
}

export interface Assessment {
  foodDetected: boolean;
  confidence: number;
  detectedItems: string[];
  reason: string;
}

export interface NutritionSummary {
  today: { date: string; calories: number; protein: number; carbs: number; fat: number };
  week: {
    date: string;
    day: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  targets: Goals;
}

export interface StreakPayload {
  current: number;
  longest: number;
  totalRecipesCooked: number;
  points: number;
  week: { day: string; done: boolean; isToday: boolean }[];
  milestones: {
    days: number;
    name: string;
    reward: string;
    status: 'completed' | 'in-progress' | 'locked';
  }[];
  daysToNextMilestone: number;
}

export interface CommunityPost {
  id: string;
  user: { id: string; name: string };
  groupId: string | null;
  groupName: string | null;
  text: string;
  image: string;
  recipe: { id: string; title: string; imageUrl: string; kcal: number } | null;
  likes: number;
  likedByMe: boolean;
  comments: number;
  createdAt: string;
  timeAgo: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  kind: 'Friends' | 'Family';
  members: number;
  memberNames: string[];
  sharedRecipes: number;
}

export interface CommunityChallenge {
  key: string;
  name: string;
  description: string;
  days: number;
  reward: string;
  participants: number;
  joined: boolean;
  progress: number;
  completed: boolean;
}

export interface UserStats {
  streak: number;
  recipes: number;
  points: number;
  groups: number;
  totalRecipesCooked: number;
  memberSince: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let cachedToken: string | null = null;

function webStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export async function getToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;
  try {
    cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    cachedToken = null;
  }
  if (!cachedToken) {
    cachedToken = webStorage()?.getItem(TOKEN_KEY) ?? null;
  }
  return cachedToken;
}

export async function storeToken(token: string): Promise<void> {
  cachedToken = token;
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // SecureStore unavailable (web): fall through to web storage
  }
  try {
    webStorage()?.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export async function clearToken(): Promise<void> {
  cachedToken = null;
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore
  }
  try {
    webStorage()?.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string' ? payload.message : `Request failed (${response.status})`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export interface SessionPayload {
  token?: string;
  user: ApiUser;
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<SessionPayload>('POST', '/auth/register', { name, email, password }),

  login: (email: string, password: string) =>
    request<SessionPayload>('POST', '/auth/login', { email, password }),

  me: () => request<SessionPayload>('GET', '/auth/me'),

  detect: (imageBase64: string, mimeType = 'image/jpeg') =>
    request<{ assessment: Assessment }>('POST', '/ai/detect', { imageBase64, mimeType }),

  generateRecipe: (input: { imageBase64?: string; mimeType?: string; cuisine: string; servings: number; manualIngredient?: string }) =>
    request<{ recipe: Recipe }>('POST', '/ai/recipe', input),

  saveRecipe: (recipe: Recipe) =>
    request<{ recipe: Recipe }>('POST', '/recipes', { recipe }),

  myRecipes: () => request<{ recipes: Recipe[] }>('GET', '/recipes'),

  getRecipe: (id: string) => request<{ recipe: Recipe }>('GET', `/recipes/${id}`),

  deleteRecipe: (id: string) => request<{ ok: boolean }>('DELETE', `/recipes/${id}`),

  logMeal: (recipeId: string, servings: number) =>
    request<{ log: { totals: { calories: number; protein: number; carbs: number; fat: number } }; points: number }>(
      'POST',
      '/meals/log',
      { recipeId, servings }
    ),

  nutritionSummary: () => request<NutritionSummary>('GET', '/nutrition/summary'),

  streak: () => request<{ streak: StreakPayload }>('GET', '/streak'),

  posts: (groupId?: string) =>
    request<{ posts: CommunityPost[] }>('GET', `/community/posts${groupId ? `?groupId=${groupId}` : ''}`),

  likePost: (id: string) =>
    request<{ likes: number; likedByMe: boolean }>('POST', `/community/posts/${id}/like`, {}),

  createGroup: (name: string, kind: 'Friends' | 'Family') =>
    request<{ group: CommunityGroup }>('POST', '/community/groups', { name, kind }),

  groups: () => request<{ groups: CommunityGroup[] }>('GET', '/community/groups'),

  shareToGroup: (groupId: string, recipeId: string) =>
    request<{ post: CommunityPost }>('POST', `/community/groups/${groupId}/share`, { recipeId }),

  challenges: () => request<{ challenges: CommunityChallenge[] }>('GET', '/community/challenges'),

  joinChallenge: (key: string) =>
    request<{ joined: boolean }>('POST', `/community/challenges/${key}/join`, {}),

  challengeProgress: (key: string) =>
    request<{ progress: number; completed: boolean }>('POST', `/community/challenges/${key}/progress`, {}),

  stats: () => request<{ stats: UserStats; goals: Goals; subscription: Subscription }>('GET', '/auth/stats'),

  updateGoals: (goals: Partial<Goals>) => request<{ goals: Goals }>('PUT', '/auth/goals', goals),

  purchase: (plan: 'monthly' | 'yearly') =>
    request<{ subscription: Subscription; points: number }>('POST', '/subscription/purchase', { plan }),
};
