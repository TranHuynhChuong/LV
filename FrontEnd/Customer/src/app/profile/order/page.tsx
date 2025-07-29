import OrderPanel from '@/components/profile/order/order-panel';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <OrderPanel />
    </Suspense>
  );
}
