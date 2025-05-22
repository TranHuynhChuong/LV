'use client';

import { useEffect } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axiosClient';
import { toast } from 'sonner';
import { StaffForm } from '../components/staffForm';
import { useAuth } from '@/contexts/AuthContext';

type New = {
  NV_matKhau: string;
  NV_vaiTro: string;
  NV_hoTen: string;
  NV_email: string;
  NV_soDienThoai: string;
};

export default function New() {
  const router = useRouter();
  const { authData } = useAuth();

  const { setBreadcrumbs } = useBreadcrumb();
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
      toast.error('Lỗi khi thêm nhân viên!');
      console.error('Lỗi khi thêm nhân viên:', error);
    }
  };

  return (
    <div className="w-full h-fit max-w-xl min-w-md">
      <StaffForm onSubmit={handleOnsubmit} />
    </div>
  );
}
