import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/axiosClient'; // axios instance đã cấu hình withCredentials

type AuthGuardProps = {
  readonly allowedRoles: readonly string[];
  readonly children: React.ReactNode;
};

export function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const router = useRouter();
  const { role, clearAuth } = useAuthStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyToken() {
      if (role === null) return;
      if (!role || !allowedRoles.includes(role)) {
        router.replace('/login');
        return;
      }
      try {
        await api.get('/auth/check-token');
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    }

    verifyToken();
  }, [role, allowedRoles, router, clearAuth]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}
