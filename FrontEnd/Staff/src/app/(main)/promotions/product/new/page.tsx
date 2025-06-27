'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Loader from '@/components/utils/Loader';
import { mapProductPromotionDetailToDto, ProductPromotionDetail } from '@/models/promotionProduct';
import ProductPromotionForm from '@/components/promotions/product/ProductPromotionForm';

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

  async function onSubmit(data: ProductPromotionDetail) {
    try {
      if (!authData.userId) return;
      setIsSubmitting(true);
      const apiData = mapProductPromotionDetailToDto(data, authData.userId);
      await api.post('/promotions', apiData);
      toast.success('Thêm mới thành công!');
      router.back();
    } catch (error) {
      console.error(error);
      toast.error('Thêm mới thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative w-full h-fit ">
      <div className="w-full max-w-6xl p-4 mx-auto h-fit ">
        <ProductPromotionForm onSubmit={onSubmit} />
      </div>
      {isSubmitting && <Loader />}
    </div>
  );
}
