'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function VoucherPromotionFormLoading() {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-sm shadow space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="w-32 h-6" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-60 h-10" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-60 h-10" />
          </div>
        </div>
      </div>
      <div className="p-6 bg-white rounded-sm shadow space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="w-12 h-6 rounded-full" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="h-10 w-60" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="h-10 w-60" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="w-32 h-6" />
          <Skeleton className="h-10 w-60" />
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <Skeleton className="w-24 h-10" />
        <Skeleton className="w-24 h-10" />
      </div>
    </div>
  );
}
