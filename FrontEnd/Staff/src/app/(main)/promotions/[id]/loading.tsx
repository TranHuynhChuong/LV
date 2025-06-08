import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="relative w-full max-w-2xl xl:max-w-4xl mx-auto p-4 h-fit">
      <div className="space-y-4 min-w-fit">
        <section className="p-8 space-y-6 bg-white rounded-sm shadow">
          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-full" />
          </div>

          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-full" />
          </div>

          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex flex-col sm:flex-row space-x-0 space-y-4 sm:space-x-4 sm:space-y-0">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-full" />
          </div>
        </section>
        {/* Detail */}
        <section className="p-6 space-y-6 bg-white rounded-sm shadow">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-42" />
          </div>

          <Skeleton className="h-8 w-full" />
        </section>
      </div>
    </div>
  );
}
