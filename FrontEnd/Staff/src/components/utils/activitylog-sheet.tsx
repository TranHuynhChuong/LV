'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ActivityLogs } from '@/models/activityLogs';
import { useAuth } from '@/contexts/auth-context';

type Props = {
  activityLogs: ActivityLogs[];
};

export default function ActionHistorySheet({ activityLogs }: Readonly<Props>) {
  function formatDate(date: string | Date) {
    return new Date(date).toLocaleString();
  }

  function renderUserInfo(user: ActivityLogs['user']) {
    return (
      <ul className="ml-8 list-disc">
        <li>ID: {user.id}</li>
        <li>Họ tên: {user.name}</li>
        <li>SĐT: {user.phone}</li>
        <li>Email: {user.email}</li>
      </ul>
    );
  }

  function renderItemContent(item: ActivityLogs) {
    if (item.action.startsWith('Cập nhật')) {
      const parts = item.action.split(':');
      const title = parts[0];
      const details = parts[1]?.split(',').map((s) => s.trim()) ?? [];

      return (
        <div className="space-y-1 text-sm">
          <p>Thời gian: {formatDate(item.time)}</p>
          <p>Thao tác: {title}</p>
          {details.length > 0 && (
            <ul className="ml-8 list-disc">
              {details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          )}
          {item.user.id && item.user.name && item.user.phone && item.user.email && (
            <>
              <p>Người thực hiện:</p>
              {renderUserInfo(item.user)}
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-1 text-sm">
        <p>Thời gian: {formatDate(item.time)}</p>
        <p>Thao tác: {item.action}</p>
        {item.user.id && item.user.name && item.user.phone && item.user.email && (
          <>
            <p>Người thực hiện:</p>
            {renderUserInfo(item.user)}
          </>
        )}
      </div>
    );
  }

  const { authData } = useAuth();

  if (authData.userId && authData.role !== 1) return null;
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
          {activityLogs.length > 0 && (
            <div className="mt-4 space-y-3 text-sm">
              <Accordion type="multiple" className="w-full">
                {activityLogs.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="cursor-pointer">
                      {item.action.startsWith('Cập nhật') ? 'Cập nhật' : item.action} –{' '}
                      {formatDate(item.time)}
                    </AccordionTrigger>
                    <AccordionContent>{renderItemContent(item)}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
