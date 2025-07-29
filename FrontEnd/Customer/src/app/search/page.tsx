import SearchPanel from '@/components/search/searchPanel';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <SearchPanel />
    </Suspense>
  );
}
