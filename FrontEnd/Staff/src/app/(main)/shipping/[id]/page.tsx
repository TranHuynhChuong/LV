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
        const data = res.data.shippingFee;
        const staff = res.data.staff;
        console.log(res.data);
        setInitialData({
          fee: data.VC_phi,
          weight: data.VC_ntl,
          surcharge: data.VC_phuPhi,
          surchargeUnit: data.VC_dvpp,
          provinceId: data.T_id,
          createdAt: data.VC_tao,
          updatedAt: data.VC_capNhat,
          staff: {
            id: data.NV_id,
            name: staff.NV_hoTen,
            phone: staff.NV_soDienThoai,
            email: staff.NV_email,
          },
        });
        console.log(initialData);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Không thể tải dữ liệu');
        router.back();
      })
      .finally(() => setLoading(false));
  }, [id, router, initialData]);

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
      .put(`/shipping/${id}`, apiData)
      .then(() => {
        toast.success('Cập nhật thành công');
        router.back();
      })
      .catch((error) => {
        console.error(error);
        toast.error('Lỗi khi cập nhật phí vận chuyển');
      });
  };

  const handleDelete = () => {
    if (!id) return;

    api
      .delete(`/shipping/${id}`)
      .then(() => {
        toast.success('Xoá thành công');
        router.back();
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.response.data.message);
      });
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (!initialData) return <p>Không tìm thấy dữ liệu.</p>;

  return (
    <div className="w-full h-fit min-w-md max-w-xl relative">
      <ShippingFeeForm
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        defaultValues={initialData}
      />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="absolute top-6 right-6 cursor-pointer">
            <Info></Info>
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Thông tin dữ liệu</SheetTitle>
            <div className=" text-sm space-y-3 mt-4">
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
                <span className="font-light text-xs text-gray-500 italic">
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
