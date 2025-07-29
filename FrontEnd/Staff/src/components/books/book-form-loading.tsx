'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function BookFormLoading() {
  return (
    <div className="space-y-6">
      <section className="p-8 space-y-6 bg-white rounded-sm shadow">
        <Skeleton className="w-1/4 h-6" />
        <div className="flex gap-4">
          <Skeleton className="w-40 h-40 rounded-md" />
          <div className="flex-1 space-y-4">
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
            <Skeleton className="w-full h-10" />
          </div>
        </div>
      </section>

      <section className="p-6 space-y-6 bg-white rounded-sm shadow">
        <Skeleton className="w-1/4 h-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full h-10" />
          ))}
        </div>
      </section>

      <section className="p-6 space-y-6 bg-white rounded-sm shadow">
        <Skeleton className="w-1/4 h-6" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="w-full h-10" />
          ))}
        </div>
      </section>

      <div className="flex justify-end space-x-4">
        <Skeleton className="w-24 h-10" />
        <Skeleton className="w-24 h-10" />
      </div>
    </div>
  );
}
