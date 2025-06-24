'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axiosClient';

import StaffTable from '@/components/accounts/staffTable';
import SwitchTab from '../switchTab';
import Loader from '@/components/utils/Loader';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { mapStaffFormDto, Staff } from '@/models/accounts';

export default function Staffs() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [data, setData] = useState<Staff[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { authData } = useAuth();

  async function getData() {
    setIsLoading(true);
    try {
      const res = await api.get('/users/staffs');
      const data = res.data;
      setData(data.length > 0 ? mapStaffFormDto(data) : []);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  async function handleConfirmDelete(id: string) {
    if (!id) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/users/staff/${id}?staffId=${authData.userId}`);
      toast.success('Xóa thành công!');
      router.refresh();
    } catch (error) {
      toast.error('Xóa thất bại!');
      console.error('Xóa thất bại:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

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
