import VoucherPromotionPanel from '@/components/promotions/voucher/voucher-promotion-panel';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <VoucherPromotionPanel />
    </Suspense>
  );
}
