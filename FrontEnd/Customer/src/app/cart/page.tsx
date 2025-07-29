import CartPanel from '@/components/cart/cart-panel';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <CartPanel />
    </Suspense>
  );
}
