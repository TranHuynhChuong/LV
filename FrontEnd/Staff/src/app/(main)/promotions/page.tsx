'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductsList() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/promotions/product');
  }, [router]);

  return null;
}
