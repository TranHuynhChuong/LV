'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import api from '@/lib/axios';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/utils/Loader';
import { mapShippingFeeToDto, ShippingFee } from '@/models/shipping';
import ShippingFeeForm from '@/components/shipping/ShippingForm';

export default function CreateShippingPage() {
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
      .catch((error) => {
        console.error(error);
        toast.error('Thêm mới thất bại!');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="p-4  ">
      <div className="w-full max-w-lg min-w-fit  mx-auto ">
        {isSubmitting && <Loader />}
        <ShippingFeeForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
