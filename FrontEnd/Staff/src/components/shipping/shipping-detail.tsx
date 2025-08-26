'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axios-client';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useAuth } from '@/contexts/auth-context';
import Loader from '@/components/utils/loader';
import { mapShippingFeeFromDto, mapShippingFeeToDto } from '@/models/shipping';
import type { ShippingFee } from '@/models/shipping';
import ShippingFeeForm from './shipping-form';
import { ActionHistorySheet } from '../utils/activitylog-sheet-dynamic-import';
import ShippingFeeFormLoading from './shipping-form-loading';

export default function ShippingDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();
  const [data, setData] = useState<ShippingFee>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Phí vận chuyển', href: '/' },
      { label: 'Chi tiết phí vận chuyển' },
    ]);
  }, [setBreadcrumbs]);

  const getData = useCallback(
    async function getData() {
      if (!id) return;
      try {
        const res = await api.get(`/shipping/${id}`);
        const data = res.data;
        setData(mapShippingFeeFromDto(data));
      } catch {
        toast.error('Đã xảy ra lỗi!');
        router.back();
      }
    },
    [id, router]
  );

  useEffect(() => {
    getData();
  }, [getData]);

  async function handleSubmit(data: ShippingFee) {
    if (!authData.userId) return;

    const apiData = mapShippingFeeToDto(data, authData.userId);
    setIsSubmitting(true);

    try {
      await api.put(`/shipping/${id}`, apiData);
      toast.success('Cập nhật thành công');
      router.back();
    } catch {
      toast.error('Cập nhật thất bại!');
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!authData.userId) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/shipping/${id}?staffId=${authData.userId}`);
      toast.success('Xoá thành công');
      router.back();
    } catch {
      toast.error('Xóa thất bại!');
      setIsSubmitting(false);
    }
  }
  if (!data) return <ShippingFeeFormLoading />;
  else
    return (
      <>
        {isSubmitting && <Loader />}
        <ShippingFeeForm onSubmit={handleSubmit} onDelete={handleDelete} defaultValues={data} />

        <div className="absolute top-6 right-6">
          <ActionHistorySheet dataName="PhiVanChuyen" dataId={id} />
        </div>
      </>
    );
}
