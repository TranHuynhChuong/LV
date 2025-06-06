'use client';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

export default function Orders() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Đơn hàng' }]);
  }, [setBreadcrumbs]);
  return <div>Orders</div>;
}
