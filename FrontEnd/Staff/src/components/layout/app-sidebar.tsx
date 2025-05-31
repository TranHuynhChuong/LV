'use client';

import * as React from 'react';
import { NavMain } from '@/components/layout/nav-main';
import { NavUser } from '@/components/layout/nav-user';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
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
  ShoppingBag,
  ChartBar,
  Package,
  Percent,
  Star,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { authData } = useAuth();
  const fullNav = [
    { title: 'Tài khoản', url: '/accounts', icon: UserCog },
    { title: 'Sản phẩm', url: '/products', icon: ShoppingBag },
    { title: 'Danh mục', url: '/categories', icon: ChartBar },
    { title: 'Đơn hàng', url: '/orders', icon: Package },
    { title: 'Khuyến mãi', url: '/promotions', icon: Percent },
    { title: 'Đánh giá', url: '/reviews', icon: Star },
    { title: 'Vận chuyển', url: '/shipping', icon: Truck },
  ];

  type NavItem = { title: string; url: string; icon: LucideIcon };
  let navMain: NavItem[] = [];

  if (authData.role === 'Admin') {
    navMain = fullNav;
  } else if (authData.role === 'Manager') {
    navMain = fullNav.filter((item) => item.url !== '/accounts');
  } else if (authData.role === 'Sale') {
    navMain = fullNav.filter((item) => item.url === '/orders');
  }

  const data = {
    user: {
      role: authData.role ?? '',
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
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                logo
              </div>
              <div className="grid flex-1 text-left text-lg leading-tight ml-5">
                <span className="truncate font-semibold">Bookie</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {authData.userId ? (
          <NavMain items={data.navMain} />
        ) : (
          <div className="space-y-2 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        {authData.userId ? (
          <NavUser user={data.user} />
        ) : (
          <div className="p-2">
            <Skeleton className="h-10 w-full" />
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
