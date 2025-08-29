'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Loader from '@/components/utils/loader';
import VoucherPromotionForm from './voucher-promotion-form';
import { Voucher } from '@/models/voucher';

export default function VoucherPromotionNew() {
  const { setBreadcrumbs } = useBreadcrumb();
  const { authData } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Mã giảm giá', href: '/promotions/vouchers' },
      { label: 'Thêm mới' },
    ]);
  }, [setBreadcrumbs]);

  async function onSubmit(data: Voucher): Promise<void> {
    if (!authData.userId) return;

    const apiData = { ...data, staffId: authData.userId };
    setIsSubmitting(true);

    try {
      await api.post('/vouchers', apiData);
      toast.success('Thêm mới thành công!');
      router.back();
    } catch {
      toast.error('Thêm mới thất bại!');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative w-full h-fit ">
      <div className="w-full max-w-6xl p-4 mx-auto h-fit ">
        <VoucherPromotionForm onSubmit={onSubmit} />
      </div>
      {isSubmitting && <Loader />}
    </div>
  );
}
