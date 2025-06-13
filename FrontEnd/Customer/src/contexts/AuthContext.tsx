// contexts/AuthContext.tsx
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
};

const AuthContext = createContext<AuthContextType>({
  authData: { userId: null, role: null },
  setAuthData: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authData, setAuthData] = useState<AuthData>({
    userId: null,
    role: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/getAuth')
      .then(async (res) => {
        const data = await res.json();
        setAuthData({ userId: data.userId, role: data.role });
      })
      .catch(() => {
        setAuthData({ userId: null, role: null });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ authData, setAuthData, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
