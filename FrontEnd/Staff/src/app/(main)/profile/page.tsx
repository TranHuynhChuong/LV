'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

import api from '@/lib/axios';

import { toast } from 'sonner';
import Loading from './loading';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { StaffForm } from '@/components/accounts/staffForm';
import { mapStaffFormDto, Staff } from '@/models/accounts';

export default function StaffDetailPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [staffData, setStaffData] = useState<Staff>();
  const router = useRouter();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Hồ sơ' }]);

    fetchData();
  }, [authData.userId]);

  const fetchData = async () => {
    if (!authData.userId) return;
    try {
      const res = await api.get(`/users/staff/${authData.userId}`);
      const staff = res.data;
      setStaffData(mapStaffFormDto([staff])[0]);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin nhân viên:', error);
      toast.error('Đã xảy ra lỗi khi tải dữ liệu!');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

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
