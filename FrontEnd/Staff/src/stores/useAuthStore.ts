// src/store/authStore.ts
import { create } from 'zustand';

type AuthState = {
  userId: string | null;
  accessToken: string | null;
  role: string | null;
  setAuth: (accessToken: string, userId: string, role: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  accessToken: null,
  role: null,
  setAuth: (accessToken, userId, role) => set({ userId, accessToken, role }),
  clearAuth: () => set({ userId: null, accessToken: null, role: null }),
}));
