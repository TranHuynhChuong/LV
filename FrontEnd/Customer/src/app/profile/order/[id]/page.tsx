'use client';

import OrderDetail from '@/components/profile/order/order-detail';
import api from '@/lib/axios';
import { mapOrderFromDto, Order } from '@/models/order';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<Order>();

  const fetchData = useCallback(
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
    fetchData(id);
  }, [id, fetchData]);

  if (!data)
    return (
      <div className="">
        <div className="w-full max-w-xl mx-auto min-w-fit"></div>
      </div>
    );

  return (
    <div className="w-full ">
      <div className="w-full mx-auto ">{data && <OrderDetail data={data} />}</div>
    </div>
  );
}
