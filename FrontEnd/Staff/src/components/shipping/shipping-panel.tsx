'use client';

import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import api from '@/lib/axios-client';
import EventBus from '@/lib/event-bus';
import { mapShippingFeesFromDtoList, ShippingFee } from '@/models/shipping';
import { useCallback, useEffect, useState } from 'react';
import ShippingTable from './shipping-table';

export default function ShippingPanel() {
  const { setBreadcrumbs } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Trang chủ', href: '/' }, { label: 'Phí vận chuyển' }]);
  }, [setBreadcrumbs]);

  const [data, setData] = useState<ShippingFee[]>([]);

  const getData = useCallback(async function getData(): Promise<void> {
    try {
      const res = await api.get('/shipping');
      const mapped = mapShippingFeesFromDtoList(res.data);
      setData(mapped);
    } catch {
      setData([]);
    }
  }, []);

  useEffect(() => {
    getData();
    const handler = () => getData();
    EventBus.on('shipping:refetch', handler);

    return () => {
      EventBus.off('shipping:refetch', handler);
    };
  }, [getData]);

  return (
    <div className="p-4 bg-white border rounded-md min-w-fit">
      <ShippingTable data={data} />
    </div>
  );
}
