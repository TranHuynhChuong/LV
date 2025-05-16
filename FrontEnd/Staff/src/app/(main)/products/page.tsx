'use client';

import { AuthGuard } from '@/components/guard/AuthGuard';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/BreadcrumbContext';
export default function Products() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Sản phẩm' }]);
  }, [setBreadcrumbs]);
  return (
    <AuthGuard allowedRoles={['Admin', 'Manager']}>
      <div>Products</div>
    </AuthGuard>
  );
}
