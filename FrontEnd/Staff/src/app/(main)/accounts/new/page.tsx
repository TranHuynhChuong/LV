'use client';

import { useEffect } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axiosClient';
import { toast } from 'sonner';
import { StaffForm, StaffFormData } from '../components/staffForm';
import { useAuth } from '@/contexts/AuthContext';

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

  const handleOnsubmit = (data: StaffFormData) => {
    const payload = {
      NV_hoTen: data.fullName,
      NV_soDienThoai: data.phone,
      NV_email: data.email,
      NV_vaiTro: Number(data.role),
      NV_matKhau: data.password,
      NV_idNV: authData.userId,
    };

    api
      .post('/users/staff', payload)
      .then(() => {
        toast.success('Thêm mới thành công!');
        router.back();
      })
      .catch((error) => {
        if (error.status === 400) {
          toast.error('Thêm mới thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error('Lỗi khi thêm nhân viên:', error);
      });
  };

  return (
    <div className="w-full max-w-xl h-fit min-w-md">
      <StaffForm onSubmit={handleOnsubmit} />
    </div>
  );
}
