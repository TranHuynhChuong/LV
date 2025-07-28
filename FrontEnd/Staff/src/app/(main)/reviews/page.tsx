import ReviewPanel from '@/components/reviews/review-panel';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <ReviewPanel />
    </Suspense>
  );
}
