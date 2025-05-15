// src/store/authStore.ts
import { create } from 'zustand';

type AuthState = {
  userId: string | null;
  accessToken: string | null;
  role: string | null;
  setAuth: (userId: string, accessToken: string, role: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  accessToken: null,
  role: null,
  setAuth: (userId, accessToken, role) => set({ userId, accessToken, role }),
  clearAuth: () => set({ userId: null, accessToken: null, role: null }),
}));
