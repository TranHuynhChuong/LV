import OrderPanel from '@/components/orders/order-panel';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <OrderPanel />
    </Suspense>
  );
}
