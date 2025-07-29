'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function ShippingFeeFormLoading() {
  return (
    <div className="w-full p-6 space-y-6 bg-white rounded-md shadow-sm">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
