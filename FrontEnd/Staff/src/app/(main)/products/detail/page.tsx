'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectBackPage() {
  const router = useRouter();

  useEffect(() => {
    router.back();
  }, []);

  return null;
}
