'use client';

import AuthGuard from '@/components/guard/AuthGuard';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/BreadcrumbContext';

export default function Accounts() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Tài khoản' }]);
  }, [setBreadcrumbs]);
  return (
    <AuthGuard allowedRoles={['Admin']}>
      <div>Account</div>
    </AuthGuard>
  );
}
