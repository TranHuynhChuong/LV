'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useOrderStore } from '@/stores/orderStore';

export default function RouteWatcher() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const clearOrder = useOrderStore((state) => state.clearOrder);

  useEffect(() => {
    if (prevPath.current?.startsWith('/checkout') && !pathname.startsWith('/checkout')) {
      clearOrder();
      prevPath.current = pathname;
    }
  }, [pathname, clearOrder]);

  return null;
}
