'use client';

import { OrderOverview } from '@/models/order';
import OrderItem from './order-item';

type OrderListProps = {
  orders: OrderOverview[];
};

export default function OrderList({ orders }: Readonly<OrderListProps>) {
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
