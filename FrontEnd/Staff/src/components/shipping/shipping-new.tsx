'use client';

import Loader from '@/components/utils/loader';
import { useAuth } from '@/contexts/auth-context';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import { mapShippingFeeToDto, ShippingFee } from '@/models/shipping';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ShippingFeeForm from './shipping-form';

export default function ShippingNew() {
  const router = useRouter();
  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Vận chuyển', href: '/shipping' },
      { label: 'Thêm mới phí vận chuyển' },
    ]);
  }, [setBreadcrumbs]);

  const handleSubmit = (data: ShippingFee) => {
    if (!authData.userId) return;
    const apiData = mapShippingFeeToDto(data, authData.userId);
    setIsSubmitting(true);
    api
      .post('/shipping', apiData)
      .then(() => {
        toast.success('Thêm mới thành công');
        router.back();
      })
      .catch(() => {
        toast.error('Thêm mới thất bại!');
        setIsSubmitting(false);
      });
  };

  return (
    <div className="p-4 ">
      <div className="w-full max-w-lg mx-auto min-w-fit ">
        {isSubmitting && <Loader />}
        <ShippingFeeForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
