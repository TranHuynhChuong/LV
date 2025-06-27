'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axios';

import { mapOrderFromDto, Order } from '@/models/orders';
import OrderDetail from '@/components/profiles/orders/orderDetail';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<Order>();

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
      <div className="">
        <div className=" w-full max-w-xl mx-auto min-w-fit"></div>
      </div>
    );

  return (
    <div className=" w-full">
      <div className=" w-full mx-auto">{data && <OrderDetail data={data} />}</div>
    </div>
  );
}
