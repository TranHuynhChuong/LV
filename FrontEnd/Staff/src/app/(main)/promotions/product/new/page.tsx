'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

import api from '@/lib/axiosClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';
import ProductPromotionForm, { ProductPromotionFormType } from '../components/ProductPromotionForm';

export function mapDataPushPut(formData: ProductPromotionFormType, NV_id: string | null) {
  return {
    KM_ten: formData.name ?? '', // nếu optional thì check default ''
    KM_id: formData.code,
    KM_batDau: formData.from,
    KM_ketThuc: formData.to,
    NV_id: NV_id, // lấy từ người dùng hiện tại hoặc context
    KM_chiTiet:
      formData.detail?.map((item) => ({
        KM_id: formData.code,
        SP_id: item.productId,
        CTKM_theoTyLe: item.isPercent,
        CTKM_giaTri: item.value,
        CTKM_tamNgung: item.isBlocked,
      })) || [],
  };
}

export default function ProductPromotionNew() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Giảm giá sản phẩm', href: '/promotions/product' },
      { label: 'Thêm mới' },
    ]);
  }, [setBreadcrumbs]);

  const onSubmit = (data: ProductPromotionFormType) => {
    const apiData = mapDataPushPut(data, authData.userId);
    setIsSubmitting(true);
    api
      .post('/promotions', apiData)
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
        <ProductPromotionForm onSubmit={onSubmit} />
      </div>
      {isSubmitting && <Loader />}
    </div>
  );
}
