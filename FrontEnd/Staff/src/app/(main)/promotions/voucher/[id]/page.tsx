'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

import api from '@/lib/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import Loader from '@/components/utils/Loader';
import Loading from './loading';
import { ActionHistorySheet } from '@/components/utils/ActivityLogSheet';
import {
  mapVoucherPromotionDetailFromDto,
  mapVoucherPromotionDetailToDto,
} from '@/models/promotionVoucher';
import type { VoucherPromotionDetail } from '@/models/promotionVoucher';
import { ActivityLogs } from '@/models/activityLogs';
import VoucherPromotionForm from '@/components/promotions/voucher/VoucherPromotionForm';

export default function VoucherPromotionDetail() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Giảm giá sản phẩm', href: '/promotions/voucher' },
      { label: 'Chi tiết' },
    ]);
  }, [setBreadcrumbs]);

  const onSubmit = (data: VoucherPromotionDetail) => {
    if (!authData.userId) return;
    setIsSubmitting(true);
    const updateData = mapVoucherPromotionDetailToDto(data, authData.userId);
    api
      .put(`/vouchers/${id}`, updateData)
      .then(() => {
        toast.success('Cập nhật thành công!');
        router.back();
      })
      .catch((error) => {
        if (error?.status === 400) {
          toast.error('Cập nhật thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error(error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const [data, setData] = useState<VoucherPromotionDetail>();
  const [loading, setLoading] = useState<boolean>(false);

  const [activityLogs, setActivityLogs] = useState<ActivityLogs[]>([]);

  const fetchData = () => {
    api
      .get(`/vouchers/${id}`)
      .then((res) => {
        const { data, activityLogs } = mapVoucherPromotionDetailFromDto(res.data);
        setData(data);
        setActivityLogs(activityLogs);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Không tìm thấy sản phẩm!');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="p-4">
        <div className="w-full max-w-6xl p-4 mx-auto ">
          <Loading />
        </div>
      </div>
    );

  return (
    <div className="p-4">
      <div className="w-full max-w-6xl  mx-auto ">
        <div className="relative ">
          <VoucherPromotionForm onSubmit={onSubmit} defaultValues={data} />
          <ActionHistorySheet activityLogs={activityLogs} />
        </div>

        {isSubmitting && <Loader />}
      </div>
    </div>
  );
}
