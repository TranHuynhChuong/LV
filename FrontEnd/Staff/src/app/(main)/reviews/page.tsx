'use client';

import { useEffect } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
export default function Reviews() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Đánh giá sản phẩm' }]);
  }, [setBreadcrumbs]);
  return <div>Reviews</div>;
}
