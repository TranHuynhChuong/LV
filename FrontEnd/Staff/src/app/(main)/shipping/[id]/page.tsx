'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ShippingFeeForm, { ShippingFormData } from '../components/ShippingForm';
import api from '@/lib/axiosClient';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useAuth } from '@/contexts/AuthContext';
import Loading from './loading';
import { ActionHistorySheet } from '@/components/ActivityLogSheet';
import { Metadata } from '@/type/Metadata';
import { ActivityLog } from '@/type/ActivityLog';
import Loader from '@/components/Loader';

export default function ShippingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<ShippingFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metadata, setMetadata] = useState<Metadata[]>([]);

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Vận chuyển', href: '/' },
      { label: 'Chi tiết phí vận chuyển' },
    ]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    if (!id) return;

    api
      .get(`/shipping/${id}`)
      .then((res) => {
        const data = res.data;
        setInitialData({
          fee: data.PVC_phi,
          weight: data.PVC_ntl,
          surcharge: data.PVC_phuPhi,
          surchargeUnit: data.PVC_dvpp,
          provinceId: data.T_id,
        });

        const metadataFormatted =
          data.lichSuThaoTac?.map((item: ActivityLog) => ({
            time: item.thoiGian,
            action: item.thaoTac,
            user: {
              id: item.nhanVien?.NV_id,
              name: item.nhanVien?.NV_hoTen,
              phone: item.nhanVien?.NV_soDienThoai,
              email: item.nhanVien?.NV_email,
            },
          })) ?? [];
        setMetadata(metadataFormatted);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Đã xảy ra lỗi!');
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = (data: ShippingFormData) => {
    const apiData = {
      PVC_phi: data.fee ?? 0,
      PVC_ntl: data.weight ?? 0,
      PVC_phuPhi: data.surcharge ?? 0,
      PVC_dvpp: data.surchargeUnit ?? 0,
      T_id: data.provinceId ?? 0,
      NV_id: authData.userId,
    };
    setIsSubmitting(true);
    api
      .put(`/shipping/${id}`, apiData)
      .then((res) => {
        toast.success(res.data.message ?? 'Cập nhật thành công');
        router.back();
      })
      .catch((error) => {
        if (error.status === 400) {
          toast.error('Cập nhật thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error(error);
      })
      .finally(() => setIsSubmitting(false));
  };

  const handleDelete = () => {
    if (!id) return;
    setIsSubmitting(true);
    api
      .delete(`/shipping/${id}`)
      .then((res) => {
        toast.success(res.data.message ?? 'Xoá thành công');
        router.back();
      })
      .catch((error) => {
        console.error(error);
        const msg = error?.response?.data?.message ?? 'Đã xảy ra lỗi!';
        toast.error(msg);
      })
      .finally(() => setIsSubmitting(false));
  };

  if (loading)
    return (
      <div className="p-4">
        <div className="relative w-full max-w-xl min-w-fit  mx-auto">
          <Loading />
        </div>
      </div>
    );

  return (
    <div className="p-4">
      <div className="relative w-full max-w-xl min-w-fit  mx-auto">
        {isSubmitting && <Loader />}
        <ShippingFeeForm
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          defaultValues={initialData}
        />
        <ActionHistorySheet metadata={metadata} />
      </div>
    </div>
  );
}
