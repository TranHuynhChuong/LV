// app/accounts/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SwitchTab() {
  const { setBreadcrumbs } = useBreadcrumb();
  const [staff, setStaff] = useState(0);
  const [customer, setCustomer] = useState(0);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Tài khoản' }]);
    getCount();
  }, [setBreadcrumbs]);

  const getCount = async () => {
    try {
      const { data } = await api.get('users/total');
      setStaff(data.staff);
      setCustomer(data.customer);
    } catch (error) {
      console.error(error);
    }
  };

  const tabs = [
    { label: `Nhân viên (${staff})`, value: 'staffs' },
    { label: `Khách hàng (${customer})`, value: 'customers' },
  ];

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => {
        const isActive = pathname?.includes(tab.value);
        return (
          <Button
            key={tab.value}
            variant={isActive ? 'default' : 'outline'}
            onClick={() => router.push(`/accounts/${tab.value}`)}
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
