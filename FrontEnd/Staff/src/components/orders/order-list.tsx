'use client';

import { OrderOverview } from '@/models/orders';
import OrderItem from './order-item';
import OrderItemLoading from './order-item-loading';

type Props = {
  orders: OrderOverview[];
};

export default function OrderList({ orders }: Readonly<Props>) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((order, index) => (
          <OrderItemLoading key={index} />
        ))}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {orders.map((order) => (
        <OrderItem key={order.orderId} order={order} />
      ))}
    </div>
  );
}
