'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type AuthData = {
  userId: string | null;
  role: number | null;
};

type AuthContextType = {
  authData: AuthData;
  setAuthData: (data: AuthData) => void;
  isLoading: boolean;
  loadAuth: () => Promise<void>; // 🔁 thêm hàm gọi lại auth
};

const AuthContext = createContext<AuthContextType>({
  authData: { userId: null, role: null },
  setAuthData: () => {},
  isLoading: true,
  loadAuth: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authData, setAuthData] = useState<AuthData>({
    userId: null,
    role: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  const loadAuth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/getAuth');
      const data = await res.json();
      setAuthData({ userId: data.userId, role: data.role });
    } catch {
      setAuthData({ userId: null, role: null });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuth(); // lần đầu load trang sẽ gọi auth
  }, []);

  return (
    <AuthContext.Provider value={{ authData, setAuthData, isLoading, loadAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
