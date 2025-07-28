import CustomerPanel from '@/components/account/customer/customer.panel';
import { Suspense } from 'react';

export default async function Page() {
  return (
    <Suspense>
      <CustomerPanel />
    </Suspense>
  );
}
