import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-wrap gap-4 h-full ">
      <div className="basis-0 flex-[5] min-w-86 h-124 p-4 bg-white rounded-md flex flex-col gap-4">
        <Skeleton className="flex-1 w-full " />
        <Skeleton className="h-20 w-full " />
      </div>

      <div className="basis-0 flex-[7] p-4 bg-white rounded-md h-fit space-y-4">
        <Skeleton className="h-10 w-full " />

        <div className="w-full grid grid-cols-2 gap-2">
          <Skeleton className="h-6 w-full " />
          <Skeleton className="h-6 w-full " />
          <Skeleton className="h-6 w-full " />
          <Skeleton className="h-6 w-full " />
        </div>
        <Skeleton className="h-10 w-full " />

        <Skeleton className="h-8 w-full " />

        <div className="w-full flex space-x-4">
          <Skeleton className="h-10 flex-1 " />
          <Skeleton className="h-10 flex-1 " />
        </div>
      </div>
    </div>
  );
}
