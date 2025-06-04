'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/axiosClient';
import { StaffForm } from '@/app/(main)/accounts/components/staffForm';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Loading from './loading';
import { ActionHistorySheet } from '@/components/ActivityLogSheet';
import { ActivityLog } from '@/type/ActivityLog';
import { Metadata } from '@/type/Metadata';
import { StaffFormData } from '../components/staffForm';

export default function StaffDetailPage() {
  const { setBreadcrumbs } = useBreadcrumb();
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [staffData, setStaffData] = useState<StaffFormData | null>(null);
  const [metadata, setMetadata] = useState<Metadata[]>([]);
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
        const data = res.data;

        setStaffData({
          fullName: data.NV_hoTen,
          phone: data.NV_soDienThoai,
          email: data.NV_email,
          role: String(data.NV_vaiTro),
          id: data.NV_id,
          password: data.NV_matKhau,
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
        console.error('Lỗi khi lấy thông tin nhân viên:', error);
        toast.error('Đã xảy ra lỗi khi tải dữ liệu!');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, setBreadcrumbs]);

  const handleOnSubmit = (data: StaffFormData) => {
    const payload = {
      NV_hoTen: data.fullName,
      NV_soDienThoai: data.phone,
      NV_email: data.email,
      NV_vaiTro: Number(data.role),
      NV_matKhau: data.password,
      NV_idNV: authData.userId,
    };

    api
      .put(`/users/staff/${id}`, payload)
      .then(() => {
        toast.success('Cập nhật thành công!');
        router.back();
      })
      .catch((error) => {
        if (error.status === 400) {
          toast.error('Cập nhật thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error('Lỗi khi cập nhật nhân viên:', error);
      });
  };

  const handleOnDelete = () => {
    api
      .delete(`/users/staff/${id}`)
      .then(() => {
        toast.success('Xóa thành công!');
        router.back();
      })
      .catch((error) => {
        if (error.status === 400) {
          toast.error('Xóa thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error('Lỗi khi xóa nhân viên:', error);
      });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="relative flex w-full max-w-xl space-x-2 h-fit">
      {staffData && (
        <StaffForm defaultValues={staffData} onSubmit={handleOnSubmit} onDelete={handleOnDelete} />
      )}

      <ActionHistorySheet metadata={metadata} />
    </div>
  );
}
