'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import api from '@/lib/axios';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useAuth } from '@/contexts/auth-context';
import Loading from './loading';
import { ActionHistorySheet } from '@/components/utils/activitylog-sheet';

import Loader from '@/components/utils/loader';
import { mapShippingFeeFromDto, mapShippingFeeToDto } from '@/models/shipping';
import type { ShippingFee } from '@/models/shipping';
import { ActivityLogs, mapActivityLogsFromDto } from '@/models/activityLogs';
import ShippingFeeForm from '@/components/shipping/shipping-form';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<ShippingFee>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLogs[]>([]);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Vận chuyển', href: '/' },
      { label: 'Chi tiết phí vận chuyển' },
    ]);
  }, [setBreadcrumbs]);

  const fetchShippingData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/shipping/${id}`);
      const data = res.data;
      setInitialData(mapShippingFeeFromDto(data));
      setActivityLogs(mapActivityLogsFromDto(data.lichSuThaoTac));
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu phí vận chuyển:', error);
      toast.error('Đã xảy ra lỗi!');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShippingData();
  }, [id]);

  async function handleSubmit(data: ShippingFee) {
    if (!authData.userId) return;

    const apiData = mapShippingFeeToDto(data, authData.userId);
    setIsSubmitting(true);

    try {
      const res = await api.put(`/shipping/${id}`, apiData);
      toast.success(res.data.message ?? 'Cập nhật thành công');
      router.back();
    } catch (error) {
      console.error('Lỗi khi cập nhật phí vận chuyển:', error);

      toast.error('Cập nhật thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }
  async function handleDelete() {
    if (!id) return;
    if (!authData.userId) return;
    setIsSubmitting(true);
    try {
      const res = await api.delete(`/shipping/${id}?staffId=${authData.userId}`);
      toast.success(res.data.message ?? 'Xoá thành công');
      router.back();
    } catch (error) {
      console.error('Lỗi khi xoá phí vận chuyển:', error);
      toast.error('Xóa thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className="p-4">
        <div className="relative w-full max-w-xl min-w-fit  mx-auto">
          <Loading />
        </div>
      </div>
    );

  return (
    <div className="p-4">
      <div className="relative w-full max-w-xl min-w-fit  mx-auto">
        {isSubmitting && <Loader />}
        <ShippingFeeForm
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          defaultValues={initialData}
        />
        {authData.role && authData.userId && authData.role === 1 && (
          <div className=" absolute top-6 right-6">
            <ActionHistorySheet activityLogs={activityLogs} />
          </div>
        )}
      </div>
    </div>
  );
}
