'use client';

import Loader from '@/components/utils/loader';
import { useAuth } from '@/contexts/auth-context';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { mapStaffFormDto, mapStaffToDto, Staff } from '@/models/accounts';
import { ActivityLogs, mapActivityLogsFromDto } from '@/models/activityLogs';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import StaffFormLoading from './staff-form-loading';
import StaffForm from './staff-form';
import { ActionHistorySheet } from '@/components/utils/activitylog-sheet-dynamic-import';

export default function StaffDetail() {
  const { setBreadcrumbs } = useBreadcrumb();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<Staff>();
  const [activityLogs, setActivityLogs] = useState<ActivityLogs[]>([]);
  const { authData } = useAuth();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Tài khoản', href: '/accounts' },
      { label: 'Chi tiết nhân viên' },
    ]);
  }, [setBreadcrumbs]);

  const getData = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/users/staff/${id}`);
      const data = res.data;
      setData(mapStaffFormDto([data])[0]);
      setActivityLogs(mapActivityLogsFromDto(data.lichSuThaoTac));
    } catch {
      toast.error('Đã xảy ra lỗi khi tải dữ liệu!');
      router.back();
    }
  }, [id, router]);

  useEffect(() => {
    getData();
  }, [getData]);

  async function handleOnSubmit(data: Staff) {
    if (!authData.userId) return;

    const payload = mapStaffToDto(data, authData.userId);
    setIsSubmitting(true);
    try {
      await api.put(`/users/staff/${id}`, payload);
      toast.success('Cập nhật thành công');
      router.back();
    } catch {
      toast.error('Cập nhật thất bại!');
      setIsSubmitting(false);
    }
  }

  if (!data) return <StaffFormLoading />;
  else
    return (
      <>
        <StaffForm defaultValues={data} onSubmit={handleOnSubmit} />
        {isSubmitting && <Loader />}
        <div className="absolute top-6 right-6">
          <ActionHistorySheet activityLogs={activityLogs} />
        </div>
      </>
    );
}
