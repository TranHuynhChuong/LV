'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

import api from '@/lib/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Loader from '@/components/utils/Loader';
import { mapVoucherPromotionDetailToDto, VoucherPromotionDetail } from '@/models/promotionVoucher';
import VoucherPromotionForm from '@/components/promotions/voucher/VoucherPromotionForm';

export default function VoucherPromotionNew() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Mã giảm giá', href: '/promotions/voucher' },
      { label: 'Thêm mới' },
    ]);
  }, [setBreadcrumbs]);

  const onSubmit = (data: VoucherPromotionDetail) => {
    if (!authData.userId) return;
    const apiData = mapVoucherPromotionDetailToDto(data, authData.userId);
    setIsSubmitting(true);
    api
      .post('/vouchers', apiData)
      .then(() => {
        toast.success('Thêm mới thành công!');
        router.back();
      })
      .catch((error) => {
        if (error?.status === 400) {
          toast.error('Thêm mới thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error(error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="relative w-full h-fit ">
      <div className="w-full max-w-6xl p-4 mx-auto h-fit ">
        <VoucherPromotionForm onSubmit={onSubmit} />
      </div>
      {isSubmitting && <Loader />}
    </div>
  );
}
