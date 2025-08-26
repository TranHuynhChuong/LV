'use client';

import Loader from '@/components/utils/loader';
import { useAuth } from '@/contexts/auth-context';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import type { VoucherPromotionDetail } from '@/models/promotionVoucher';
import {
  mapVoucherPromotionDetailFromDto,
  mapVoucherPromotionDetailToDto,
} from '@/models/promotionVoucher';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import VoucherPromotionFormLoading from './voucher-promotion-form-loading';
import VoucherPromotionForm from './voucher-promotion-form';
import { ActionHistorySheet } from '@/components/utils/activitylog-sheet-dynamic-import';

export default function VoucherPromotionDetail() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Mã giảm giá', href: '/promotions/vouchers' },
      { label: 'Chi tiết mã giảm giá' },
    ]);
  }, [setBreadcrumbs]);

  const [data, setData] = useState<VoucherPromotionDetail>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(data: VoucherPromotionDetail) {
    if (!authData.userId) return;
    setIsSubmitting(true);
    try {
      const updateData = mapVoucherPromotionDetailToDto(data, authData.userId);
      await api.put(`/vouchers/${id}`, updateData);
      toast.success('Cập nhật thành công!');
      router.back();
    } catch {
      toast.error('Cập nhật thất bại!');
      setIsSubmitting(false);
    }
  }

  async function onDelete(): Promise<void> {
    if (!id) return;
    if (!authData.userId) return;

    const now = new Date();
    const start = data?.startAt;

    if (start && start <= now) {
      toast.error('Không thể xoá vì mã giảm giá đã hoặc đang diễn ra!');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.delete(`/vouchers/${id}`);
      toast.success('Xoá mã giảm giá thành công!');
      router.back();
    } catch {
      toast.error('Xoá mã giảm giá thất bại!');
      setIsSubmitting(false);
    }
  }

  const getData = useCallback(
    async function getData() {
      if (!id) return;
      try {
        const res = await api.get(`/vouchers/${id}`);
        const { data } = mapVoucherPromotionDetailFromDto(res.data);
        setData(data);
      } catch {
        toast.error('Không tìm thấy mã giảm!');
        router.back();
      }
    },
    [id, router]
  );

  useEffect(() => {
    getData();
  }, [getData]);
  if (!data) return <VoucherPromotionFormLoading />;
  else
    return (
      <>
        <div className="relative ">
          <VoucherPromotionForm
            onSubmit={onSubmit}
            defaultValues={data}
            onDelete={onDelete}
            isViewing={!!data?.startAt && data.startAt < new Date()}
          />

          <div className="absolute top-6 right-6">
            <ActionHistorySheet dataName="MaGiam" dataId={id} />
          </div>
        </div>
        {isSubmitting && <Loader />}
      </>
    );
}
