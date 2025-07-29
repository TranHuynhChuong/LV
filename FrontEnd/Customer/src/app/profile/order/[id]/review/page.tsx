import ReviewPanel from '@/components/review/review-panel';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <ReviewPanel />
    </Suspense>
  );
}
