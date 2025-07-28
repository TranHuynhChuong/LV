import BookPanel from '@/components/books/book-panel';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <BookPanel />
    </Suspense>
  );
}
