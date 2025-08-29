'use client';

import OrderInf from '@/components/profile/order/order-inf';
import api from '@/lib/axios-client';
import { Order } from '@/models/order';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function OrderDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<Order>();

  const getData = useCallback(
    async (id: string) => {
      try {
        const res = await api.get(`orders/detail/${id}`);
        const item = res.data;
        setData(item);
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

  if (!data)
    return (
      <div className="">
        <div className="w-full max-w-xl mx-auto min-w-fit"></div>
      </div>
    );

  return (
    <div className="w-full ">
      <div className="w-full mx-auto ">{data && <OrderInf data={data} />}</div>
    </div>
  );
}
