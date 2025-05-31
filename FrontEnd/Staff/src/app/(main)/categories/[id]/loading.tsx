import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="w-full max-w-xl h-fit min-w-md space-y-6">
      <div className="w-full p-6 space-y-6 bg-white rounded-md shadow-sm">
        <Skeleton className="h-6 w-full " />
        <div className="w-full h-fit space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="w-full h-fit space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>

      <div className="sticky bottom-0 flex items-center w-full p-6 space-x-4 bg-white rounded-md shadow h-fit">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
