import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { api, clearToken, getToken, storeToken, type ApiUser } from '@/lib/api';

interface AuthState {
  user: ApiUser | null;
  loading: boolean;
  signIn: (token: string, user: ApiUser) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const payload = await api.me();
        setUser(payload.user);
      } catch {
        await clearToken();
        setUser(null);
      }
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (token: string, nextUser: ApiUser) => {
    await storeToken(token);
    setUser(nextUser);
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const payload = await api.me();
      setUser(payload.user);
    } catch {
      // keep current state
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
