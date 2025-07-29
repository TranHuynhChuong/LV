'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function BookPromotionFormLoading() {
  return (
    <div className="space-y-6">
      <div className="p-6 space-y-6 bg-white rounded-sm shadow">
        <Skeleton className="w-1/3 h-6" />

        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="flex-1 h-10" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-60 h-10" />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-60 h-10" />
        </div>
      </div>

      <div className="p-6 space-y-4 bg-white rounded-sm shadow">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="w-40 h-5 mb-1" />
            <Skeleton className="w-24 h-4" />
          </div>
          <Skeleton className="w-24 h-9 rounded-md" />
        </div>

        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <Skeleton className="w-6 h-6 rounded-sm" />
              <Skeleton className="flex-1 h-8" />
              <Skeleton className="w-24 h-8" />
              <Skeleton className="w-24 h-8" />
              <Skeleton className="w-8 h-8" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Skeleton className="w-24 h-10" />
        <Skeleton className="w-24 h-10" />
      </div>
    </div>
  );
}
