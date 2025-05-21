// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthData = {
  userId: string | null;
  role: string | null;
};

const AuthContext = createContext<{
  authData: AuthData;
  setAuthData: (data: AuthData) => void;
}>({
  authData: { userId: null, role: null },
  setAuthData: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [authData, setAuthData] = useState<AuthData>({
    userId: null,
    role: null,
  });

  useEffect(() => {
    fetch('/api/getAuth')
      .then(async (res) => {
        if (!res.ok) {
          setAuthData({ userId: null, role: null });
          router.replace('/login');
          return;
        }
        const data = await res.json();
        setAuthData({ userId: data.userId, role: data.role });
      })
      .catch(() => {
        setAuthData({ userId: null, role: null });
      });
  }, [router]);

  const contextValue = useMemo(() => ({ authData, setAuthData }), [authData, setAuthData]);
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
