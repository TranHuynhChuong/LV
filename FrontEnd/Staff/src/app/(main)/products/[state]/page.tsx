'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function RedirectToFirstPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const state = String(params?.state ?? 'live');
    router.replace(`/products/${state}/1`);
  }, []);

  return null;
}
