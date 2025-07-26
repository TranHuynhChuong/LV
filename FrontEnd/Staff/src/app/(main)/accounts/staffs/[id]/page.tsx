'use client';

import { useCallback, useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import { StaffForm } from '@/components/accounts/staff-form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import Loading from './loading';
import { ActionHistorySheet } from '@/components/utils/activitylog-sheet';
import Loader from '@/components/utils/loader';
import { mapStaffFormDto, mapStaffToDto, Staff } from '@/models/accounts';
import { ActivityLogs, mapActivityLogsFromDto } from '@/models/activityLogs';

export default function Page() {
  const { setBreadcrumbs } = useBreadcrumb();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [staffData, setStaffData] = useState<Staff>();
  const [activityLogs, setActivityLogs] = useState<ActivityLogs[]>([]);
  const { authData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaffDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/users/staff/${id}`);
      const data = res.data;
      setStaffData(mapStaffFormDto([data])[0]);
      setActivityLogs(mapActivityLogsFromDto(data.lichSuThaoTac));
    } catch {
      toast.error('Đã xảy ra lỗi khi tải dữ liệu!');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Tài khoản', href: '/accounts' },
      { label: 'Chi tiết nhân viên' },
    ]);

    fetchStaffDetail();
  }, [fetchStaffDetail, setBreadcrumbs]);

  async function handleOnSubmit(data: Staff) {
    if (!authData.userId) return;

    const payload = mapStaffToDto(data, authData.userId);
    setIsSubmitting(true);
    try {
      await api.put(`/users/staff/${id}`, payload);
      toast.success('Cập nhật thành công!');
      router.back();
    } catch {
      toast.error('Cập nhật thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOnDelete() {
    if (!authData.userId) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/users/staff/${id}?staffId=${authData.userId}`);
      toast.success('Xóa thành công!');
      router.back();
    } catch {
      toast.error('Xóa thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading)
    return (
      <div className="p-4">
        <div className="relative flex w-full max-w-xl space-x-2 mx-auto">
          <Loading />
        </div>
      </div>
    );

  return (
    <div className="p-4">
      <div className="relative flex w-full max-w-xl space-x-2 mx-auto">
        {staffData && (
          <StaffForm
            defaultValues={staffData}
            onSubmit={handleOnSubmit}
            onDelete={handleOnDelete}
          />
        )}
        {isSubmitting && <Loader />}

        {authData.role && authData.userId && authData.role === 1 && (
          <div className=" absolute top-6 right-6">
            <ActionHistorySheet activityLogs={activityLogs} />
          </div>
        )}
      </div>
    </div>
  );
}
