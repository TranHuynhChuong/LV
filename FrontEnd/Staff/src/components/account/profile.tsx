'use client';

import { useAuth } from '@/contexts/auth-context';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { Staff } from '@/models/accounts';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import StaffFormLoading from './staff/staff-form-loading';
const StaffForm = dynamic(() => import('@/components/account/staff/staff-form'), {
  loading: () => <StaffFormLoading />,
  ssr: false,
});
export default function Profile() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const [data, setData] = useState<Staff>();
  const router = useRouter();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Hồ sơ' }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    const getData = async () => {
      if (!authData.userId) return;
      try {
        const res = await api.get(`/users/staffs/${authData.userId}`);
        const staff = res.data;
        setData(staff);
      } catch (error) {
        console.error(error);
        toast.error('Đã xảy ra lỗi khi tải dữ liệu!');
        router.back();
      }
    };

    getData();
  }, [authData.userId, router]);
  if (!data) return <StaffFormLoading />;
  else return <>{data && <StaffForm defaultValues={data} isViewing={true} />}</>;
}
