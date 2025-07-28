'use client';

import { StaffForm } from '@/components/account/staff/staff-form';
import { useAuth } from '@/contexts/auth-context';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { mapStaffFormDto, Staff } from '@/models/accounts';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Profile() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const [staffData, setStaffData] = useState<Staff>();
  const router = useRouter();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Hồ sơ' }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    const getData = async () => {
      if (!authData.userId) return;
      try {
        const res = await api.get(`/users/staff/${authData.userId}`);
        const staff = res.data;
        setStaffData(mapStaffFormDto([staff])[0]);
      } catch {
        toast.error('Đã xảy ra lỗi khi tải dữ liệu!');
        router.back();
      }
    };

    getData();
  }, [authData.userId, router]);

  return (
    <div className="p-4">
      <div className="w-full max-w-xl mx-auto ">
        {staffData && <StaffForm defaultValues={staffData} isViewing={true} />}
      </div>
    </div>
  );
}
