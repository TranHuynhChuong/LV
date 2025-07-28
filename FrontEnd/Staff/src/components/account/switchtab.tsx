'use client';

import { Button } from '@/components/ui/button';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import EventBus from '@/lib/event-bus';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SwitchTab() {
  const { setBreadcrumbs } = useBreadcrumb();
  const [staff, setStaff] = useState(0);
  const [customer, setCustomer] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Tài khoản' }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    const getTotal = async () => {
      try {
        const { data } = await api.get('users/total');
        setStaff(data.staff);
        setCustomer(data.customer);
      } catch {
        setStaff(0);
        setCustomer(0);
      }
    };
    getTotal();
    const handler = () => getTotal();
    EventBus.on('staff:refetch', handler);
    return () => {
      EventBus.off('staff:refetch', handler);
    };
  }, []);

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
            className="cursor-pointer"
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
