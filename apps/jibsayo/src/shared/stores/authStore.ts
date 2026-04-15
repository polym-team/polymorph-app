import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  provider: string;
}

interface AuthStore {
  isReady: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  set: (params: { isAuthenticated: boolean; user: AuthUser | null }) => void;
  markReady: () => void;
}

export const useAuthStore = create<AuthStore>(set => ({
  isReady: false,
  isAuthenticated: false,
  user: null,
  set: ({ isAuthenticated, user }) => set({ isAuthenticated, user }),
  markReady: () => set({ isReady: true }),
}));
