'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Loader from '@/components/utils/loader';
import { mapBookPromotionDetailToDto, BookPromotionDetail } from '@/models/promotionBook';
import BookPromotionForm from './book-promotion-form';

export default function BookPromotionNew() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Giảm giá sách', href: '/promotions/books' },
      { label: 'Thêm mới' },
    ]);
  }, [setBreadcrumbs]);

  async function onSubmit(data: BookPromotionDetail) {
    try {
      if (!authData.userId) return;
      setIsSubmitting(true);
      const apiData = mapBookPromotionDetailToDto(data, authData.userId);
      await api.post('/promotions', apiData);
      toast.success('Thêm mới thành công');
      router.back();
    } catch {
      toast.error('Thêm mới thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative w-full h-fit ">
      <div className="w-full max-w-6xl p-4 mx-auto h-fit ">
        <BookPromotionForm onSubmit={onSubmit} />
      </div>
      {isSubmitting && <Loader />}
    </div>
  );
}
