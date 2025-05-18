'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  userId: string;
  role: string;
  exp: number;
}

interface AuthGuardProps {
  allowedRoles?: string[];
  children: ReactNode;
}

export default function AuthGuard({ allowedRoles = [], children }: AuthGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp < currentTime) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        router.push('/login');
        return;
      }

      // Nếu qua hết các chốt, cho render UI
      setLoading(false);
    } catch {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [allowedRoles, router]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}
