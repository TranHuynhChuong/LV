import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="relative w-full max-w-2xl xl:max-w-4xl mx-auto  h-fit">
      <div className="space-y-4 min-w-fit">
        <section className="p-8 space-y-6 bg-white rounded-sm shadow">
          <Skeleton className="h-4 w-full" />
          {/* Cover Image */}
          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="w-40 h-42" />
          </div>
          {/* Product Images */}
          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="w-20 h-22" />
          </div>

          {/* Name */}

          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-4 w-26" />
            <Skeleton className="h-8 w-full" />
          </div>

          {/* Category */}
          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-4 w-26" />
            <Skeleton className="h-8 w-full" />
          </div>

          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-4 w-26" />
            <Skeleton className="h-8 w-full" />
          </div>
        </section>
        {/* Detail */}
        <section className="p-6 space-y-6 bg-white rounded-sm shadow">
          <Skeleton className="h-4 w-full" />

          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-4 w-26" />
            <Skeleton className="h-8 w-full" />
          </div>

          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-4 w-26" />
            <Skeleton className="h-8 w-full" />
          </div>

          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-4 w-26" />
            <Skeleton className="h-8 w-full" />
          </div>

          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-4 w-26" />
            <Skeleton className="h-8 w-full" />
          </div>

          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-4 w-26" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-4 w-26" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-4 w-26" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
              <Skeleton className="h-4 w-26" />
              <Skeleton className="h-8 w-full" />
            </div>

            <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
              <Skeleton className="h-4 w-26" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </section>
        <section className="p-6 space-y-6 bg-white rounded-sm shadow">
          <Skeleton className="h-4 w-full" />
          {/* Sales Information */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>

            <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>

            <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
