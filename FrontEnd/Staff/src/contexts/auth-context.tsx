// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

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
  const router = useRouter();
  const pathname = usePathname();

  const [authData, setAuthData] = useState<AuthData>({
    userId: null,
    role: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Không gọi lại ở trang login
    if (pathname === '/login') {
      setIsLoading(false);
      return;
    }

    fetch('/api/getAuth')
      .then(async (res) => {
        if (!res.ok) {
          router.replace('/login');
          return;
        }

        const data = await res.json();
        setAuthData({ userId: data.userId, role: data.role });
      })
      .catch(() => {
        router.replace('/login');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const contextValue = useMemo(
    () => ({ authData, setAuthData, isLoading }),
    [authData, setAuthData, isLoading]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
