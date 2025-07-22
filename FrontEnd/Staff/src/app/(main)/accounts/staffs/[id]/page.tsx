'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axios';
import { StaffForm } from '@/components/accounts/staffForm';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Loading from './loading';
import { ActionHistorySheet } from '@/components/utils/ActivityLogSheet';
import Loader from '@/components/utils/Loader';
import { mapStaffFormDto, mapStaffToDto, Staff } from '@/models/accounts';
import { ActivityLogs, mapActivityLogsFromDto } from '@/models/activityLogs';

export default function StaffDetailPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [staffData, setStaffData] = useState<Staff>();
  const [activityLogs, setActivityLogs] = useState<ActivityLogs[]>([]);
  const { authData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function fetchStaffDetail() {
    setIsLoading(true);
    try {
      const res = await api.get(`/users/staff/${id}`);
      const data = res.data;
      console.log(data);
      setStaffData(mapStaffFormDto([data])[0]);
      setActivityLogs(mapActivityLogsFromDto(data.lichSuThaoTac));
    } catch (error) {
      console.error('Lỗi khi lấy thông tin nhân viên:', error);
      toast.error('Đã xảy ra lỗi khi tải dữ liệu!');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Tài khoản', href: '/accounts' },
      { label: 'Chi tiết nhân viên' },
    ]);

    fetchStaffDetail();
  }, [id]);

  async function handleOnSubmit(data: Staff) {
    if (!authData.userId) return;

    const payload = mapStaffToDto(data, authData.userId);
    setIsSubmitting(true);
    try {
      await api.put(`/users/staff/${id}`, payload);
      toast.success('Cập nhật thành công!');
      router.back();
    } catch (error) {
      toast.error('Cập nhật thất bại!');
      console.error('Lỗi khi cập nhật nhân viên:', error);
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
    } catch (error) {
      toast.error('Xóa thất bại!');

      console.error('Lỗi khi xóa nhân viên:', error);
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
