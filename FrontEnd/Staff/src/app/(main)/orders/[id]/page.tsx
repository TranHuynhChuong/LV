'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { ActionHistorySheet } from '@/components/utils/activitylog-sheet';
import { mapOrderFromDto, Order } from '@/models/orders';
import OrderDetail from '@/components/orders/order-detail';
import { useAuth } from '@/contexts/auth-context';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();

  const [data, setData] = useState<Order>();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Trang chủ', href: '/' },
      { label: 'Đơn hàng', href: '/orders' },
      { label: 'Chi tiết đơn hàng' },
    ]);
  }, [setBreadcrumbs]);

  const fetchData = useCallback(
    async (id: string) => {
      try {
        const res = await api.get(`orders/detail/${id}`);
        const item = res.data;
        const mapped = await mapOrderFromDto(item);

        setData(mapped);
      } catch (error) {
        console.error(error);
        toast.error('Không tìm thấy đơn hàng!');
        router.back();
      }
    },
    [router]
  );

  useEffect(() => {
    if (!id) return;
    fetchData(id);
  }, [id, fetchData]);

  if (!data)
    return (
      <div className="p-4">
        <div className="relative w-full max-w-xl mx-auto min-w-fit"></div>
      </div>
    );

  return (
    <div className="p-4">
      <div className="relative w-full mx-auto">
        {data && <OrderDetail data={data} />}
        {authData.role && authData.userId && authData.role === 1 && (
          <div className=" absolute top-6 right-6">
            <ActionHistorySheet activityLogs={data.activityLogs} />
          </div>
        )}
      </div>
    </div>
  );
}
