'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function OrderItemLoading() {
  return (
    <div className="bg-white border rounded-md p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="space-y-2">
        {[...Array(1)].map((_, i) => (
          <div key={i} className="flex gap-2 py-1">
            <Skeleton className="w-14 h-14 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end text-sm">
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="flex justify-end gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}
