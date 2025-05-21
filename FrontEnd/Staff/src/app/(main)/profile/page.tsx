'use client';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

export default function Profile() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Hồ sơ tài khoản' }]);
  }, [setBreadcrumbs]);
  return <div>Profile</div>;
}
