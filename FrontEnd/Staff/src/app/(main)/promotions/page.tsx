'use client';

import AuthGuard from '@/components/guard/AuthGuard';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/BreadcrumbContext';
export default function Promotions() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Khuyến mãi' }]);
  }, [setBreadcrumbs]);
  return (
    <AuthGuard allowedRoles={['Admin', 'Manager']}>
      <div>Promotions</div>
    </AuthGuard>
  );
}
