'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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

export default function NewCategory() {
  const router = useRouter();
  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Danh mục', href: '/categories' },
      { label: 'Thêm mới thể loại' },
    ]);
  }, [setBreadcrumbs]);
  const handleSubmit = (data: ShippingFormData) => {
    const apiData = {
      PVC_phi: data.fee ?? 0,
      PVC_ntl: data.weight ?? 0,
      PVC_phuPhi: data.surcharge ?? 0,
      PVC_dvpp: data.surchargeUnit ?? 0,
      T_id: data.provinceId ?? 0,
      NV_id: authData.userId,
    };

    api
      .post('/shipping', apiData)
      .then(() => {
        toast.success('Thêm mới thành công');
        router.back();
      })
      .catch((error) => {
        console.error(error);
        if (error.status === 400) {
          toast.error('Thêm mới thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
      });
  };

  return (
    <div className="w-full max-w-xl h-fit min-w-md ">
      
    </div>
  );
}
