import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-wrap h-full gap-4 ">
      <div className="basis-0 flex-[5] min-w-86 h-124 p-4 bg-white rounded-md flex flex-col gap-4">
        <Skeleton className="flex-1 w-full " />
        <Skeleton className="w-full h-20 " />
      </div>

      <div className="basis-0 flex-[7] p-4 bg-white rounded-md h-fit space-y-4">
        <Skeleton className="w-full h-10 " />

        <div className="grid w-full grid-cols-2 gap-2">
          <Skeleton className="w-full h-6 " />
          <Skeleton className="w-full h-6 " />
          <Skeleton className="w-full h-6 " />
          <Skeleton className="w-full h-6 " />
        </div>
        <Skeleton className="w-full h-10 " />

        <Skeleton className="w-full h-8 " />

        <div className="flex w-full space-x-4">
          <Skeleton className="flex-1 h-10 " />
          <Skeleton className="flex-1 h-10 " />
        </div>
      </div>
    </div>
  );
}
