'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axiosClient';

import { ApiStaff } from '@/type/Account';
import { StaffFormData } from './staffForm';
import StaffTable from './staffTable';
import SwitchTab from '../switchTab';
import Loader from '@/components/Loader';

export default function Staffs() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<StaffFormData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const getData = () => {
    setIsLoading(true);

    api
      .get('/users/staffs')
      .then((res) => {
        const data = res.data;

        const result: ApiStaff[] = data;

        if (result.length > 0) {
          const getRole = (vaiTro: number) => {
            if (vaiTro === 1) return 'Quản trị';
            if (vaiTro === 2) return 'Quản lý';
            if (vaiTro === 3) return 'Bán hàng';
            return 'Không xác định';
          };

          const mapped: StaffFormData[] = result.map((staff: ApiStaff) => ({
            id: staff.NV_id,
            role: getRole(staff.NV_vaiTro),
            fullName: staff.NV_hoTen,
            email: staff.NV_email,
            phone: staff.NV_soDienThoai,
          }));

          setData(mapped);
        } else {
          setData([]);
        }
      })
      .catch((error) => {
        console.error('Lỗi khi gọi API:', error);
        setData([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const handleConfirmDelete = (id: string) => {
    if (!id) return;
    setIsSubmitting(true);
    api
      .delete(`/users/staff/${id}`)
      .then(() => {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success('Xóa thành công!');
      })
      .catch((error) => {
        if (error.response?.status === 400) {
          toast.error('Xóa thất bại!');
        } else {
          toast.error('Đã xảy ra lỗi!');
        }
        console.error('Xóa thất bại:', error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="p-4">
      <div className="w-full space-y-4 bg-white p-4 rounded-sm shadow">
        {isSubmitting && <Loader />}
        <SwitchTab></SwitchTab>
        <StaffTable data={data} onDelete={handleConfirmDelete} isLoading={isLoading}></StaffTable>
      </div>
    </div>
  );
}
