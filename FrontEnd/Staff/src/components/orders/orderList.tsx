'use client';

import { Order } from '@/types/Order';
import OrderItem from './orderItem';

type Props = {
  orders: Order[];
};

export default function OrderList({ orders }: Props) {
  if (!orders.length) {
    return <p className="text-sm text-muted-foreground">Không có đơn hàng nào.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {orders.map((order) => (
        <OrderItem key={order.orderId} order={order} />
      ))}
    </div>
  );
}
