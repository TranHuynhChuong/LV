'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/axiosClient';

type Props = {
  children: ReactNode;
  role?: string;
};

export function AuthGuard({ children, role }: Props) {
  const router = useRouter();
  const { accessToken, setAuth, clearAuth, role: userRole } = useAuthStore();

  const [loading, setLoading] = useState(true); // trạng thái chờ check quyền

  useEffect(() => {
    async function checkAuth() {
      try {
        if (!accessToken) {
          // Gọi refresh token nếu chưa có
          const res = await api.get('/auth/refresh-token', { withCredentials: true });
          const { access_token, userId, role: newRole } = res.data;

          if (!access_token) throw new Error('No access token');

          setAuth(userId, access_token, newRole);

          // Kiểm tra role ngay sau khi có token mới
          if (role) {
            const allowedRoles = role.split(',').map((r) => r.trim());
            if (!allowedRoles.includes(newRole)) {
              throw new Error('Role not allowed');
            }
          }
        } else {
          // Nếu đã có token rồi, kiểm tra role
          if (role) {
            const allowedRoles = role.split(',').map((r) => r.trim());
            if (!allowedRoles.includes(userRole ?? '')) {
              throw new Error('Role not allowed');
            }
          }
        }

        setLoading(false); // auth ok -> render UI
      } catch (error) {
        console.log(error);
        clearAuth();
        router.replace('/login'); // chuyển ngay, không render UI
      }
    }

    checkAuth();
  }, [accessToken, setAuth, clearAuth, role, router, userRole]);

  if (loading) {
    // Chờ check auth xong mới render UI, hoặc có thể hiển thị loading spinner
    return null;
  }

  return <>{children}</>;
}
