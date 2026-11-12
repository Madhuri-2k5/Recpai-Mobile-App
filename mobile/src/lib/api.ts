const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:2000';

export interface Food {
  _id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Health {
  status: string;
  app: string;
  db: 'connected' | 'disconnected';
  timestamp: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => request<Health>('/api/health'),
  foods: () => request<Food[]>('/api/foods'),
  food: (id: string) => request<Food>(`/api/foods/${id}`),
  addFood: (food: Omit<Food, '_id'>) =>
    request<Food>('/api/foods', { method: 'POST', body: JSON.stringify(food) }),
};
