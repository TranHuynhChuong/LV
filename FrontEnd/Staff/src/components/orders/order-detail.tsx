'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axios-client';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { ActionHistorySheet } from '@/components/utils/activitylog-sheet';
import { mapOrderFromDto, Order } from '@/models/orders';
import OrderInf from '@/components/orders/order-inf';

export default function OrderDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { setBreadcrumbs } = useBreadcrumb();
  const [data, setData] = useState<Order>();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Đơn hàng', href: '/orders' },
      { label: 'Chi tiết đơn hàng' },
    ]);
  }, [setBreadcrumbs]);

  const getData = useCallback(
    async (id: string) => {
      try {
        const res = await api.get(`orders/detail/${id}`);
        const item = res.data;
        const mapped = await mapOrderFromDto(item);
        setData(mapped);
      } catch {
        toast.error('Không tìm thấy đơn hàng!');
        router.back();
      }
    },
    [router]
  );

  useEffect(() => {
    if (!id) return;
    getData(id);
  }, [id, getData]);

  if (!data) return null;
  else
    return (
      <div className="p-4">
        <div className="relative w-full mx-auto">
          <OrderInf data={data} />
          <div className="absolute top-6 right-6">
            <ActionHistorySheet activityLogs={data.activityLogs} />
          </div>
        </div>
      </div>
    );
}
