// app/profile/layout.tsx
'use client';
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AlignLeft } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  {
    title: 'Thông tin tài khoản',
    items: [
      { label: 'Hồ sơ', href: '/profile' },
      { label: 'Đổi email', href: '/profile/changeEmail' },
      { label: 'Đổi mật khẩu', href: '/profile/changePassword' },
      { label: 'Địa chỉ', href: '/profile/addresses' },
    ],
  },
  {
    title: 'Đơn hàng',
    items: [{ label: 'Đơn hàng của tôi', href: '/profile/orders' }],
  },
];

export function ProfileSidebar() {
  const pathname = usePathname();

  const activeItem = links.flatMap((group) => group.items).find((item) => item.href === pathname);

  const SidebarContent = () => (
    <div className="w-56 space-y-6 px-4 lg:py-4">
      {links.map((group) => (
        <div key={group.title}>
          <h4 className="text-sm font-semibold uppercase mb-2">{group.title}</h4>
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
      {/* Mobile: Sheet Drawer */}
      <div className="lg:hidden flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <AlignLeft />
            </Button>
          </SheetTrigger>

          {/* Hiển thị label của trang active */}
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

      {/* Desktop: Static Sidebar */}
      <div className="hidden lg:block border h-fit rounded-md dow bg-white">
        <SidebarContent />
      </div>
    </div>
  );
}

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const { authData } = useAuth();

  if (!authData.userId) return <></>;

  return (
    <div className=" lg:flex lg:space-x-4 space-y-4 lg:space-y-0">
      {/* Sidebar - ẩn trên mobile, hiện trên md+ */}
      <ProfileSidebar />

      <div className="flex flex-1 min-w-0">{children}</div>
    </div>
  );
}
