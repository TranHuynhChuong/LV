'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

import api from '@/lib/axiosClient';
import { StaffForm } from '@/app/(main)/accounts/components/staffForm';

import { toast } from 'sonner';

import Loading from './loading';
import { useAuth } from '@/contexts/AuthContext';

export default function StaffDetailPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [staffData, setStaffData] = useState<{
    fullName: string;
    phone: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Sale';
    id: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Hồ sơ' }]);
    if (!authData.userId) return;
    api
      .get(`/users/staff/${authData.userId}`)
      .then((res) => {
        const staff = res.data;
        setStaffData({
          fullName: staff.NV_hoTen,
          phone: staff.NV_soDienThoai,
          email: staff.NV_email,
          role: staff.NV_vaiTro,
          id: staff.NV_id,
          password: staff.NV_matKhau,
        });
      })
      .catch((error) => {
        console.error('Lỗi khi lấy thông tin nhân viên:', error);
        toast.error('Đã xảy ra lỗi khi tải dữ liệu!');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [authData.userId]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="relative flex w-full max-w-xl space-x-2 h-fit">
      {staffData && <StaffForm defaultValues={staffData} view={true} />}
    </div>
  );
}
