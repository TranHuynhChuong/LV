'use client';

import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/BreadcrumbContext';

export default function Categories() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Danh mục sản phẩm' }]);
  }, [setBreadcrumbs]);
  return <div>Categories</div>;
}
