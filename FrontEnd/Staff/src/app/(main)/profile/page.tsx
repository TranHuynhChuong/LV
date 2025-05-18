'use client';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/BreadcrumbContext';
import AuthGuard from '@/components/guard/AuthGuard';

export default function Profile() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Hồ sơ tài khoản' }]);
  }, [setBreadcrumbs]);
  return (
    <AuthGuard allowedRoles={['']}>
      <div>Profile</div>
    </AuthGuard>
  );
}
