'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ShippingFeeForm from '../components/ShippingFeeForm';
import api from '@/lib/axiosClient';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
type ShippingFormData = {
  fee?: number;
  weight?: number;
  surcharge?: number;
  surchargeUnit?: number;
  provinceId?: number;
};

export default function CreateShippingPage() {
  const router = useRouter();
  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Vận chuyển', href: '/' },
      { label: 'Thêm mới phí vận chuyển' },
    ]);
  }, [setBreadcrumbs]);
  const handleSubmit = (data: ShippingFormData) => {
    const apiData = {
      VC_phi: data.fee ?? 0,
      VC_ntl: data.weight ?? 0,
      VC_phuPhi: data.surcharge ?? 0,
      VC_dvpp: data.surchargeUnit ?? 0,
      T_id: data.provinceId ?? 0,
      NV_id: authData.userId,
    };

    api
      .post('/shipping', apiData)
      .then(() => {
        toast.success('Thêm phí vận chuyển thành công');
        router.back();
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.response.data.message);
      });
  };

  return (
    <div className="w-full max-w-xl h-fit min-w-md ">
      <ShippingFeeForm onSubmit={handleSubmit} />
    </div>
  );
}
