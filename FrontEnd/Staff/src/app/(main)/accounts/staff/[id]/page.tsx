'use client';

import AuthGuard from '@/components/guard/AuthGuard';
import { useEffect, useState, use } from 'react';
import { useBreadcrumb } from '@/context/BreadcrumbContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axiosClient';
import { StaffForm } from '@/app/(main)/accounts/components/staffForm';
import { useAuth } from '@/hooks/useAuth';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function StaffDetailPage({ params }: { readonly params: Promise<{ id: string }> }) {
  const { setBreadcrumbs } = useBreadcrumb();
  const { userId, role } = useAuth();
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

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Tài khoản', href: '/accounts' },
      { label: 'Chi tiết nhân viên' },
    ]);

    const fetchStaff = async () => {
      try {
        const res = await api.get(`/users/staff/${id}`);
        const staff = res.data.staff;
        console.log(res);
        setStaffData({
          fullName: staff.NV_hoTen,
          phone: staff.NV_soDienThoai,
          email: staff.NV_email,
          role: staff.NV_vaiTro,
          id: staff.NV_id,
          password: staff.NV_matKhau,
        });

        const NV_idNV = res.data.NV_idNV;
        if (NV_idNV) {
          setMetadata({
            createdBy: {
              id: NV_idNV.NV_id,
              name: NV_idNV.NV_hoTen,
              email: NV_idNV.NV_email,
              phone: NV_idNV.NV_soDienThoai,
            },
            createdAt: staff.NV_tao,
            updatedAt: staff.NV_capNhat,
          });
        } else {
          setMetadata({
            createdBy: {
              id: staff.NV_id,
              name: '',
              email: '',
              phone: '',
            },
            createdAt: staff.NV_tao,
            updatedAt: staff.NV_capNhat,
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin nhân viên:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, [id, setBreadcrumbs]);

  const handleOnSubmit = async (data: {
    fullName: string;
    phone: string;
    email: string;
    role: 'Admin' | 'Manager' | 'Sale';
    password?: string;
  }) => {
    try {
      const payload = {
        NV_hoTen: data.fullName,
        NV_soDienThoai: data.phone,
        NV_email: data.email,
        NV_vaiTro: data.role,
        NV_matKhau: data.password,
        NV_idNV: userId,
      };

      await api.put(`/users/staff/${id}`, payload);
      toast.success('Cập nhật thành công!');
      router.back();
    } catch (error) {
      toast.error('Đã xảy ra lỗi!');
      router.back();
      console.error('Lỗi khi cập nhật nhân viên:', error);
    }
  };

  const handleOnDelete = async () => {
    try {
      await api.delete(`/users/staff/${id}`);
      toast.success('Xóa thành công!');
      router.back();
    } catch (error) {
      toast.error('Đã xảy ra lỗi!');
      router.back();
      console.error('Lỗi khi xóa nhân viên:', error);
    }
  };
  if (isLoading) {
    return <></>;
  }
  return (
    <AuthGuard allowedRoles={['Admin']}>
      <div className="w-full max-w-xl h-fit flex space-x-2 relative">
        {staffData && (
          <StaffForm
            defaultValues={staffData}
            onSubmit={handleOnSubmit}
            onDelete={handleOnDelete}
          />
        )}

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="absolute top-4 right-8">
              <Info></Info>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Thông tin dữ liệu</SheetTitle>
              {metadata && role === 'Admin' && (
                <div className=" text-sm space-y-3 mt-4">
                  <div className="">
                    <span className="font-medium ">Ngày tạo:</span>{' '}
                    {new Date(metadata.createdAt).toLocaleString('vi-VN')}
                  </div>
                  <div className="">
                    <span className="font-medium ">Cập nhật:</span>{' '}
                    {new Date(metadata.updatedAt).toLocaleString('vi-VN')}
                  </div>
                  <div>
                    <div className="font-medium ">Người thực hiện</div>{' '}
                    <span className="font-light text-xs text-gray-500 italic">
                      Người thực hiện cập nhật dữ liệu
                    </span>
                  </div>
                  <div className="pl-4">
                    <span className="font-medium ">Mã số:</span> {metadata.createdBy.id}
                  </div>
                  <div className="pl-4">
                    <span className="font-medium ">Họ tên:</span> {metadata.createdBy.name}
                  </div>
                  <div className="pl-4">
                    <span className="font-medium ">Email:</span> {metadata.createdBy.email}
                  </div>
                  <div className="pl-4">
                    <span className="font-medium ">Số điện thoại:</span> {metadata.createdBy.phone}
                  </div>
                </div>
              )}
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </AuthGuard>
  );
}
