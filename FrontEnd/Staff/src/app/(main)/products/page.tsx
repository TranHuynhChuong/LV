'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Products() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/products/all/1');
  }, [router]);

  return null;
}
