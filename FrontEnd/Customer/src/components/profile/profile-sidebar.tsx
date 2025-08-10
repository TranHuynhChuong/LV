'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import clsx from 'clsx';
import { AlignLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  {
    title: 'Thông tin tài khoản',
    items: [
      { label: 'Hồ sơ', href: '/profile' },
      { label: 'Đổi email', href: '/profile/change-email' },
      { label: 'Đổi mật khẩu', href: '/profile/change-password' },
      { label: 'Địa chỉ', href: '/profile/address' },
    ],
  },
  {
    title: 'Đơn hàng',
    items: [{ label: 'Đơn hàng của tôi', href: '/profile/order' }],
  },
  {
    title: 'Đánh giá',
    items: [{ label: 'Đánh giá của tôi', href: '/profile/review' }],
  },
];

export default function ProfileSidebar() {
  const pathname = usePathname();
  const activeItem = links.flatMap((group) => group.items).find((item) => item.href === pathname);
  const SidebarContent = () => (
    <div className="w-56 px-4 space-y-6 lg:py-4">
      {links.map((group) => (
        <div key={group.title}>
          <h4 className="mb-2 text-sm font-semibold uppercase">{group.title}</h4>
          <div className="space-y-1">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex justify-between items-center px-3 py-2 rounded-md text-sm transition-colors',
                    isActive ? 'bg-zinc-100 font-medium' : 'hover:bg-muted'
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-2 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <AlignLeft />
            </Button>
          </SheetTrigger>
          {activeItem && <span className="font-medium">{activeItem.label}</span>}
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="p-4">
              <SheetTitle></SheetTitle>
              <SheetDescription></SheetDescription>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
      <div className="hidden bg-white border rounded-md lg:block h-fit">
        <SidebarContent />
      </div>
    </div>
  );
}
