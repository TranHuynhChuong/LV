'use client';

import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActionHistorySheetLoading() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="absolute top-0 right-0 cursor-pointer">
          <Info />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-lg">Lịch sử thao tác</SheetTitle>
          <div className="mt-4 space-y-3 text-sm">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="space-y-2 border-b pb-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
