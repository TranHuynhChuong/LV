'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function OrderInfLoading() {
  return (
    <div className="space-y-2">
      <div className="h-20 p-6 bg-white border rounded-md">
        <Skeleton className="w-2/3 h-6" />
      </div>

      <div className="p-6 bg-white border rounded-md">
        <Skeleton className="w-1/3 h-5 mb-4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row p-6 bg-white border rounded-md gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex-1 space-y-4 mt-4 md:mt-0">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 bg-white border rounded-md">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2 py-2">
            <Skeleton className="w-14 h-14 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-white border rounded-md">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
