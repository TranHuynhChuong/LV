'use client';

import AuthGuard from '@/components/guard/AuthGuard';
import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/context/BreadcrumbContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axiosClient';
import { toast } from 'sonner';
import { StaffForm } from '../components/staffForm';

type Staff = {
  NV_matKhau: string;
  NV_vaiTro: string;
  NV_hoTen: string;
  NV_email: string;
  NV_soDienThoai: string;
};
interface AuthData {
  userId: string | null;
  role: string | null;
}
export default function Staff() {
  const { setBreadcrumbs } = useBreadcrumb();
  const [authData, setAuthData] = useState<AuthData>({
    userId: null,
    role: null,
  });
  const router = useRouter();
  useEffect(() => {
    async function fetchAuth() {
      try {
        const res = await fetch('/api/getAuth');
        if (!res.ok) {
          setAuthData({ userId: null, role: null });
          router.replace('/login');
          return;
        }

        const data = await res.json();
        setAuthData({ userId: data.userId, role: data.role });
      } catch (err) {
        console.log(err);
        setAuthData({ userId: null, role: null });
      }
    }

    fetchAuth();
  }, [router]);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Tài khoản', href: '/accounts' },
      { label: 'Thêm mới nhân viên' },
    ]);
  }, [setBreadcrumbs]);

  const handleOnsubmit = async (data: {
    fullName: string;
    phone: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Sale';
    password?: string;
  }) => {
    try {
      const payload = {
        NV_hoTen: data.fullName,
        NV_soDienThoai: data.phone,
        NV_email: data.email,
        NV_vaiTro: data.role,
        NV_matKhau: data.password,
        NV_idNV: authData.userId,
      };

      await api.post('/users/staff', payload);
      toast.success('Lưu thành công!');
      router.back();
    } catch (error) {
      router.back();
      toast.error('Đã xảy ra lỗi!');
      console.error('Lỗi khi tạo nhân viên:', error);
    }
  };

  return (
    <AuthGuard allowedRoles={['Admin']}>
      <div className="w-full h-fit p-4">
        <StaffForm onSubmit={handleOnsubmit} />
      </div>
    </AuthGuard>
  );
}
