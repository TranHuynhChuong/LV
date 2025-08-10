import ReviewUserList from '@/components/review/review-user';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <ReviewUserList />
    </Suspense>
  );
}
