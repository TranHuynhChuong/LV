'use client';

import { OrderOverview } from '@/models/orders';
import OrderItemLoading from './order-item-loading';
import dynamic from 'next/dynamic';

const OrderItem = dynamic(() => import('./order-item'), {
  loading: () => <OrderItemLoading />,
  ssr: false,
});

type Props = {
  orders: OrderOverview[];
};

export default function OrderList({ orders }: Readonly<Props>) {
  if (orders.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      {orders.map((order) => (
        <OrderItem key={order.orderId} order={order} />
      ))}
    </div>
  );
}
