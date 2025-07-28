import StaffPanel from '@/components/account/staff/staff-panel';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense>
      <StaffPanel />
    </Suspense>
  );
}
