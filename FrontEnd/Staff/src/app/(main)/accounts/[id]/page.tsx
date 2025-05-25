'use client';

import { useEffect, useState, use } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axiosClient';
import { StaffForm } from '@/app/(main)/accounts/components/staffForm';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

export default function StaffDetailPage({ params }: { readonly params: Promise<{ id: string }> }) {
  const { setBreadcrumbs } = useBreadcrumb();
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [staffData, setStaffData] = useState<{
    fullName: string;
    phone: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Sale';
    id: string;
    password: string;
  } | null>(null);

  const [metadata, setMetadata] = useState<{
    createdBy: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    createdAt: string;
    updatedAt: string;
  } | null>(null);

  const { authData } = useAuth();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Tài khoản', href: '/accounts' },
      { label: 'Chi tiết nhân viên' },
    ]);

    api
      .get(`/users/staff/${id}`)
      .then((res) => {
        const staff = res.data.data;
        setStaffData({
          fullName: staff.NV_hoTen,
          phone: staff.NV_soDienThoai,
          email: staff.NV_email,
          role: staff.NV_vaiTro,
          id: staff.NV_id,
          password: staff.NV_matKhau,
        });

        setMetadata({
          createdBy: {
            id: staff.NV_idNV?.NV_id,
            name: staff.NV_idNV?.NV_hoTen ?? '',
            email: staff.NV_idNV?.NV_email ?? '',
            phone: staff.NV_idNV?.NV_soDienThoai ?? '',
          },
          createdAt: staff.NV_tao,
          updatedAt: staff.NV_capNhat,
        });
      })
      .catch((error) => {
        console.error('Lỗi khi lấy thông tin nhân viên:', error);
        toast.error(error?.response?.data?.message ?? 'Đã xảy ra lỗi khi tải dữ liệu!');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleOnSubmit = (data: {
    fullName: string;
    phone: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Sale';
    password?: string;
  }) => {
    const payload = {
      NV_hoTen: data.fullName,
      NV_soDienThoai: data.phone,
      NV_email: data.email,
      NV_vaiTro: data.role,
      NV_matKhau: data.password,
      NV_idNV: authData.userId,
    };

    api
      .put(`/users/staff/${id}`, payload)
      .then((res) => {
        toast.success(res.data.message ?? 'Cập nhật thành công!');
        router.back();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message ?? 'Đã xảy ra lỗi!');
        console.error('Lỗi khi cập nhật nhân viên:', error);
      });
  };

  const handleOnDelete = () => {
    api
      .delete(`/users/staff/${id}`)
      .then((res) => {
        toast.success(res.data.message ?? 'Xóa thành công!');
        router.back();
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || 'Đã xảy ra lỗi khi xóa!');
        console.error('Lỗi khi xóa nhân viên:', error);
      });
  };

  if (isLoading) {
    return <></>;
  }

  return (
    <div className="relative flex w-full max-w-xl space-x-2 h-fit">
      {staffData && (
        <StaffForm defaultValues={staffData} onSubmit={handleOnSubmit} onDelete={handleOnDelete} />
      )}

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="absolute cursor-pointer top-6 right-6">
            <Info />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Thông tin dữ liệu</SheetTitle>
            {metadata && (
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <span className="font-medium">Ngày tạo:</span>{' '}
                  {new Date(metadata.createdAt).toLocaleString('vi-VN')}
                </div>
                <div>
                  <span className="font-medium">Cập nhật:</span>{' '}
                  {new Date(metadata.updatedAt).toLocaleString('vi-VN')}
                </div>
                <div>
                  <div className="font-medium">Người thực hiện</div>
                  <span className="text-xs italic font-light text-gray-500">
                    Người thực hiện cập nhật dữ liệu
                  </span>
                </div>
                <div className="pl-4">
                  <span className="font-medium">Mã số:</span> {metadata.createdBy.id}
                </div>
                <div className="pl-4">
                  <span className="font-medium">Họ tên:</span> {metadata.createdBy.name}
                </div>
                <div className="pl-4">
                  <span className="font-medium">Email:</span> {metadata.createdBy.email}
                </div>
                <div className="pl-4">
                  <span className="font-medium">Số điện thoại:</span> {metadata.createdBy.phone}
                </div>
              </div>
            )}
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}
