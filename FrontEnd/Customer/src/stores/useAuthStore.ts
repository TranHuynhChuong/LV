import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type AuthState = {
  userId: string | null;
  setAuth: (userId: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      role: null,
      setAuth: (userId) => set({ userId }),
      clearAuth: () => set({ userId: null }),
    }),
    {
      name: 'auth-storage',
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
    }
  )
);
