// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthData = {
  userId: string | null;
};

const AuthContext = createContext<{
  authData: AuthData;
  setAuthData: (data: AuthData) => void;
}>({
  authData: { userId: null },
  setAuthData: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authData, setAuthData] = useState<AuthData>({
    userId: null,
  });

  useEffect(() => {
    fetch('/api/getAuth')
      .then(async (res) => {
        if (!res.ok) {
          setAuthData({ userId: null });
          return;
        }
        const data = await res.json();
        setAuthData({ userId: data.userId });
      })
      .catch(() => {
        setAuthData({ userId: null });
      });
  }, []);

  const contextValue = useMemo(() => ({ authData, setAuthData }), [authData, setAuthData]);
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
