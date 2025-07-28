'use client';

import { StaffForm } from '@/components/account/staff/staff-form';
import Loader from '@/components/utils/loader';
import { useAuth } from '@/contexts/auth-context';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import EventBus from '@/lib/event-bus';
import { mapStaffToDto, Staff } from '@/models/accounts';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function StaffNew() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Tài khoản', href: '/accounts' },
      { label: 'Thêm mới nhân viên' },
    ]);
  }, [setBreadcrumbs]);
  const { authData } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleOnsubmit(data: Staff) {
    if (!authData.userId) return;
    const payload = mapStaffToDto(data, authData.userId);
    setIsSubmitting(true);
    try {
      await api.post('/users/staff', payload);
      toast.success('Thêm mới thành công!');
      EventBus.emit('staff:refetch');
      router.back();
    } catch {
      toast.error('Thêm mới thất bại. Vui lòng thử lại!');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-xl p-4 mx-auto h-fit min-w-md">
      {isSubmitting && <Loader />}
      <StaffForm onSubmit={handleOnsubmit} />
    </div>
  );
}
