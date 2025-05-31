'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ShippingFeeForm from '../components/ShippingFeeForm';
import api from '@/lib/axiosClient';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import Loading from './loading';

type ShippingFormData = {
  fee?: number;
  weight?: number;
  surcharge?: number;
  surchargeUnit?: number;
  provinceId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  staff?: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
};

export default function ShippingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<ShippingFormData | null>(null);

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
          createdAt: data.PVC_tao,
          updatedAt: data.PVC_capNhat,
          staff: {
            id: data.NV_id.NV_id,
            name: data.NV_id.NV_hoTen,
            phone: data.NV_id.NV_soDienThoai,
            email: data.NV_id.NV_email,
          },
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error('Đã xảy ra lỗi!');
      })
      .finally(() => setLoading(false));
  }, []);

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
      });
  };

  const handleDelete = () => {
    if (!id) return;

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
      });
  };

  if (loading) return <Loading />;
  if (!initialData) return <p>Không tìm thấy dữ liệu.</p>;

  return (
    <div className="relative w-full max-w-xl h-fit min-w-md">
      <ShippingFeeForm
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        defaultValues={initialData}
      />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="absolute cursor-pointer top-6 right-6">
            <Info></Info>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Thông tin dữ liệu</SheetTitle>
            <div className="mt-4 space-y-3 text-sm ">
              <div className="">
                <span className="font-medium ">Ngày tạo:</span>{' '}
                {initialData.createdAt
                  ? new Date(initialData.createdAt).toLocaleString('vi-VN')
                  : 'N/A'}
              </div>
              <div className="">
                <span className="font-medium ">Cập nhật:</span>{' '}
                {initialData.updatedAt
                  ? new Date(initialData.updatedAt).toLocaleString('vi-VN')
                  : 'N/A'}
              </div>
              <div>
                <div className="font-medium ">Người thực hiện</div>{' '}
                <span className="text-xs italic font-light text-gray-500">
                  Người thực hiện cập nhật dữ liệu
                </span>
              </div>
              <div className="pl-4">
                <span className="font-medium ">Mã số:</span> {initialData.staff?.id}
              </div>
              <div className="pl-4">
                <span className="font-medium ">Họ tên:</span> {initialData.staff?.name}
              </div>
              <div className="pl-4">
                <span className="font-medium ">Email:</span> {initialData.staff?.email}
              </div>
              <div className="pl-4">
                <span className="font-medium ">Số điện thoại:</span> {initialData.staff?.phone}
              </div>
            </div>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
