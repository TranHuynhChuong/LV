'use client';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/BreadcrumbContext';
import AuthGuard from '@/components/guard/AuthGuard';

export default function Orders() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Đơn hàng' }]);
  }, [setBreadcrumbs]);
  return (
    <AuthGuard allowedRoles={['Admin']}>
      <div>Orders</div>
    </AuthGuard>
  );
}
