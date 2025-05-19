'use client';

import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface JwtPayload {
  exp: number;
  userId: string;
  role: string;
  [key: string]: unknown;
}

interface AuthTokenResult {
  token: string | null;
  userId: string | null;
  role: string | null;
}

export const useAuth = (): AuthTokenResult => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (!storedToken) {
      setToken(null);
      setUserId(null);
      setRole(null);
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(storedToken);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp && decoded.exp > currentTime) {
        setToken(storedToken);
        setUserId(decoded.userId ?? null);
        setRole(decoded.role ?? null);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUserId(null);
        setRole(null);
        router.push('/login');
      }
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUserId(null);
      setRole(null);
      router.push('/login');
    }
  }, [router]);

  return { token, userId, role };
};
