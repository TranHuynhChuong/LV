import BookPromotionPanel from '@/components/promotions/book/book-promotion-panel';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <BookPromotionPanel />
    </Suspense>
  );
}
