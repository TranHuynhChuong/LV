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
import { useState } from 'react';
import api from '@/lib/axios-client';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';

type Props = {
  dataName:
    | 'Sach'
    | 'DanhGia'
    | 'MaGiam'
    | 'KhuyenMai'
    | 'TaiKhoan'
    | 'PhiVanChuyen'
    | 'TheLoai'
    | 'DonHang';
  dataId: string | number;
};

export default function ActionHistorySheet({ dataName, dataId }: Readonly<Props>) {
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

  const [activityLogs, setActivityLogs] = useState<ActivityLogs[]>([]);
  const [loading, setLoading] = useState(false);
  const { authData } = useAuth();
  const [skip, setSkip] = useState(0);
  const limit = 3;
  const [showMore, setShowMore] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await api.get<ActivityLogs[]>(
        `/activityLogs/${dataName}/${dataId}?skip=${skip}&limit=${limit}`
      );
      setActivityLogs([...activityLogs, ...res.data]);
      setSkip([...activityLogs, ...res.data].length);
      if (skip === [...activityLogs, ...res.data].length) setShowMore(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (authData.userId && authData.role !== 1) return null;
  return (
    <Sheet
      onOpenChange={(open) => {
        if (open) {
          fetchData();
        }
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline" className="absolute top-0 right-0 cursor-pointer">
          <Info />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-lg">Lịch sử thao tác</SheetTitle>
          <ScrollArea className="h-[calc(100vh-80px)]  pr-4 ">
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
                {showMore && (
                  <Button onClick={fetchData} className=" cursor-pointer">
                    Thêm
                  </Button>
                )}
              </div>
            )}
            {loading && (
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
            )}
          </ScrollArea>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
