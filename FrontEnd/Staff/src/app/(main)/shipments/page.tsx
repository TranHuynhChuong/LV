'use client';

import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/BreadcrumbContext';
export default function Shipments() {
  const { setBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Phí vận chuyển' }]);
  }, [setBreadcrumbs]);
  return <div>Shipments</div>;
}
