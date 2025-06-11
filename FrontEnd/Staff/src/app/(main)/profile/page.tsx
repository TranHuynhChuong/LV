'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

import api from '@/lib/axiosClient';
import { StaffForm, StaffFormData } from '@/app/(main)/accounts/staffs/staffForm';
import { toast } from 'sonner';
import Loading from './loading';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function StaffDetailPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [staffData, setStaffData] = useState<StaffFormData>();
  const router = useRouter();
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
          role: String(staff.NV_vaiTro),
          id: staff.NV_id,
          password: staff.NV_matKhau,
        });
      })
      .catch((error) => {
        console.error('Lỗi khi lấy thông tin nhân viên:', error);
        toast.error('Đã xảy ra lỗi khi tải dữ liệu!');
        router.back();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [authData.userId]);

  if (isLoading) {
    return (
      <div className="p-4">
        <div className=" w-full max-w-xl mx-auto">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className=" w-full max-w-xl mx-auto">
        <StaffForm defaultValues={staffData} isViewing={true} />
      </div>
    </div>
  );
}
