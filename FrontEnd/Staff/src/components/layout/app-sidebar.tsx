'use client';

import * as React from 'react';
import { NavMain } from '@/components/layout/nav-main';
import { NavUser } from '@/components/layout/nav-user';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  UserCog,
  Book,
  ChartBar,
  Package,
  Percent,
  Star,
  Truck,
  type LucideIcon,
  FileChartLine,
  Home,
} from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { authData, isLoading } = useAuth();
  const fullNav = [
    { title: 'Trang chủ', url: '/', icon: Home },
    { title: 'Tài khoản', url: '/accounts', icon: UserCog },
    { title: 'Thể loại', url: '/categories', icon: ChartBar },
    { title: 'Sách', url: '/products', icon: Book },

    {
      title: 'Khuyến mãi',
      url: '/promotions',
      icon: Percent,
      items: [
        { title: 'Giảm giá sản phẩm', url: '/promotions/product' },
        { title: 'Mã giảm giá', url: '/promotions/voucher' },
      ],
    },
    { title: 'Đơn hàng', url: '/orders', icon: Package },
    { title: 'Đánh giá', url: '/reviews', icon: Star },
    { title: 'Vận chuyển', url: '/shipping', icon: Truck },
    { title: 'Thống kê', url: '/stats', icon: FileChartLine },
  ];

  type NavItem = {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: { title: string; url: string }[];
  };
  let navMain: NavItem[] = [];

  if (authData.role === 1) {
    navMain = fullNav;
  } else if (authData.role === 2) {
    navMain = fullNav.filter((item) => item.url !== '/accounts');
  } else if (authData.role === 3) {
    navMain = fullNav.filter((item) => item.url === '/orders' || item.url === '/');
  }

  const data = {
    user: {
      role: authData.role ?? null,
      code: authData.userId ?? '',
    },
    navMain,
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuButton size="lg" asChild>
            <Link href="/">
              <img src="/icon.png" alt="icon" className="h-8 w-8" />
              <div className="grid flex-1 text-left leading-tight ml-2">
                <img src="/name.png" alt="icon" className="h-6 w-fit" />
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {!isLoading ? (
          <NavMain navMain={data.navMain} />
        ) : (
          <div className="space-y-2 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        {!isLoading ? <NavUser user={data.user} /> : <div className="p-2"></div>}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
