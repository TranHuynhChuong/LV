import OrderDetail from '@/components/profile/order/order-detail';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <OrderDetail />
    </Suspense>
  );
}
