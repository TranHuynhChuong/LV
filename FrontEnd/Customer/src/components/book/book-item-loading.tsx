import { Card, CardContent } from '@/components/ui/card';

import { Skeleton } from '@/components/ui/skeleton';

export default function ProductItemLoading() {
  return (
    <Card className="relative gap-2 py-4 overflow-hidden transition-shadow duration-300 rounded-md hover:shadow-lg">
      <div className="relative px-4 h-52">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
      <CardContent className="px-4 space-y-2">
        <Skeleton className="w-full h-6 rounded-md" />
        <Skeleton className="w-full h-4 rounded-md" />
        <div className="flex justify-between">
          <Skeleton className="w-12 h-4 rounded-md" />
          <Skeleton className="w-16 h-4 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
