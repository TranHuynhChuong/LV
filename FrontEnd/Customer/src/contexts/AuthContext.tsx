'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type AuthData = {
  userId: number | null;
};

type AuthContextType = {
  authData: AuthData;
  setAuthData: (data: AuthData) => void;
  isLoading: boolean;
  loadAuth: () => Promise<void>; // 🔁 thêm hàm gọi lại auth
};

const AuthContext = createContext<AuthContextType>({
  authData: { userId: null },
  setAuthData: () => {},
  isLoading: true,
  loadAuth: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authData, setAuthData] = useState<AuthData>({
    userId: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  const loadAuth = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/getAuth');
      const data = await res.json();
      setAuthData({ userId: data.userId });
    } catch {
      setAuthData({ userId: null });
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
