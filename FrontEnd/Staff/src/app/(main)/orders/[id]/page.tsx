'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axiosClient';
import { useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { useAuth } from '@/contexts/AuthContext';
import { ActionHistorySheet } from '@/components/utils/ActivityLogSheet';
import Loader from '@/components/utils/Loader';

import { mapOrderFromDto, Order } from '@/models/orders';
import OrderDetail from '@/components/orders/orderDetail';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { authData } = useAuth();
  const { setBreadcrumbs } = useBreadcrumb();

  const [data, setData] = useState<Order>();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const res = await api.get(`orders/${id}`);
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
        <div className="relative w-full max-w-xl min-w-fit  mx-auto"></div>
      </div>
    );

  return (
    <div className="p-4">
      <div className="relative w-full  mx-auto">
        {isSubmitting && <Loader />}
        {data && <OrderDetail data={data} />}
        <ActionHistorySheet activityLogs={data.activityLogs} />
      </div>
    </div>
  );
}
