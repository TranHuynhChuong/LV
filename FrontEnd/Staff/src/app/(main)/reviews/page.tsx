'use client';

import AuthGuard from '@/components/guard/AuthGuard';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/BreadcrumbContext';
export default function Reviews() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Đánh giá sản phẩm' }]);
  }, [setBreadcrumbs]);
  return (
    <AuthGuard allowedRoles={['Admin', 'Manager']}>
      <div>Reviews</div>
    </AuthGuard>
  );
}
