'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/lib/axiosClient';
import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';

export default function Home() {
  const params = useParams();
  const router = useRouter();

  const [total, setTotal] = useState({
    all: { total: 0, in: 0, out: 0 },
    live: { total: 0, in: 0, out: 0 },
    hidden: { total: 0, in: 0, out: 0 },
  });

  const fetchTotal = async () => {
    api.get('products/total').then((res) => setTotal(res.data));
  };

  useEffect(() => {
    fetchTotal();
  }, []);

  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }]);
  }, [setBreadcrumbs]);

  const pathname = usePathname();

  return (
    <div className="p-4 space-y-2">
      <div className="space-y-4 bg-white p-4 rounded-sm shadow min-w-fit"></div>
    </div>
  );
}
