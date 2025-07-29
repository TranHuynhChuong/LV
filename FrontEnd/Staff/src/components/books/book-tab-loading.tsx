'use client';
import { Skeleton } from '@/components/ui/skeleton';

export default function BookTabLoading() {
  return (
    <div className="space-y-4 bg-white min-w-xl">
      <div className="flex items-center justify-between">
        <Skeleton className="w-32 h-6 ml-4" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between flex-1 space-x-4">
          <Skeleton className="w-40 h-9 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="w-24 h-9 rounded-md" />
            <Skeleton className="w-24 h-9 rounded-md" />
          </div>
        </div>
        <div className="flex items-center flex-1 space-x-2">
          <Skeleton className="flex-1 h-9 rounded-md" />
          <Skeleton className="flex-1 h-9 rounded-md" />
        </div>
      </div>

      <div className="mt-4 mb-2 overflow-hidden border rounded-md min-w-fit">
        <table className="w-full">
          <thead>
            <tr>
              {Array.from({ length: 4 }).map((_, index) => (
                <th key={index}>
                  <Skeleton className="h-4 w-24 mx-2 my-2" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 4 }).map((_, colIndex) => (
                  <td key={colIndex} className="px-2 py-3">
                    <Skeleton className="w-full h-4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="my-4 flex justify-center">
        <Skeleton className="w-48 h-8 rounded-md" />
      </div>
    </div>
  );
}
