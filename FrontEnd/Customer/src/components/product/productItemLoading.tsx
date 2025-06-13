import { Card, CardContent } from '@/components/ui/card';

import { Skeleton } from '@/components/ui/skeleton';

export default function ProductItemLoading() {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 relative rounded-md overflow-hidden py-4 gap-2">
      <div className="relative h-52 px-4">
        <Skeleton className="h-full w-full rounded-md" />
      </div>
      <CardContent className="px-4 space-y-2">
        <Skeleton className="h-6 w-full rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-12 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
