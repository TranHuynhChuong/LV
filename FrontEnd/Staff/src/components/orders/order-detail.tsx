'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axios-client';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { Order } from '@/models/order';
import OrderInfLoading from './order-inf-loading';
import { ActionHistorySheet } from '../utils/activitylog-sheet-dynamic-import';
import OrderInf from './order-inf';

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
        const data = res.data;
        setData(data);
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

  if (!data) return <OrderInfLoading />;
  else
    return (
      <>
        <OrderInf data={data} />
        <div className="absolute top-6 right-6">
          <ActionHistorySheet dataName="DonHang" dataId={id} />
        </div>
      </>
    );
}
