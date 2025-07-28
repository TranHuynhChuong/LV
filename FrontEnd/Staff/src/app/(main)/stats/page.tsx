import StatsPanel from '@/components/stats/stats-panel';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <StatsPanel />
    </Suspense>
  );
}
