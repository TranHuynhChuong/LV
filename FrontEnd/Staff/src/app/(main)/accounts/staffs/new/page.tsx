'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { StaffForm } from '@/components/accounts/staff-form';
import { useAuth } from '@/contexts/auth-context';
import Loader from '@/components/utils/loader';
import { mapStaffToDto, Staff } from '@/models/accounts';

export default function Page() {
  const router = useRouter();
  const { authData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Tài khoản', href: '/accounts' },
      { label: 'Thêm mới nhân viên' },
    ]);
  }, [setBreadcrumbs]);
  async function handleOnsubmit(data: Staff) {
    if (!authData.userId) return;
    const payload = mapStaffToDto(data, authData.userId);
    setIsSubmitting(true);
    try {
      await api.post('/users/staff', payload);
      toast.success('Thêm mới thành công!');
      router.back();
    } catch (error) {
      console.error('Lỗi khi thêm nhân viên:', error);
      toast.error('Thêm mới thất bại!');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-xl h-fit min-w-md mx-auto p-4">
      {isSubmitting && <Loader />}
      <StaffForm onSubmit={handleOnsubmit} />
    </div>
  );
}
