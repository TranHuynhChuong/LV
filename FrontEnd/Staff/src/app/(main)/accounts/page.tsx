'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToFirstPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/accounts/staffs');
  }, []);

  return null;
}
