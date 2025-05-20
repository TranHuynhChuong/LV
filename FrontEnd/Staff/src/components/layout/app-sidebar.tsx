'use client';

import * as React from 'react';
import { NavMain } from '@/components/layout/nav-main';
import { NavUser } from '@/components/layout/nav-user';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useEffect, useState } from 'react';

interface AuthData {
  userId: string | null;
  role: string | null;
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [authData, setAuthData] = useState<AuthData>({
    userId: null,
    role: null,
  });
  const router = useRouter();
  useEffect(() => {
    async function fetchAuth() {
      try {
        const res = await fetch('/api/getAuth');
        if (!res.ok) {
          setAuthData({ userId: null, role: null });
          router.replace('/login');
          return;
        }

        const data = await res.json();
        setAuthData({ userId: data.userId, role: data.role });
      } catch (err) {
        console.log(err);
        setAuthData({ userId: null, role: null });
      }
    }

    fetchAuth();
  }, [router]);

  const fullNav = [
    { title: 'Tài khoản', url: '/accounts', icon: UserCog },
    { title: 'Sản phẩm', url: '/products', icon: ShoppingBag },
    { title: 'Danh mục', url: '/categories', icon: ChartBar },
    { title: 'Đơn hàng', url: '/orders', icon: Package },
    { title: 'Khuyến mãi', url: '/promotions', icon: Percent },
    { title: 'Đánh giá', url: '/reviews', icon: Star },
    { title: 'Vận chuyển', url: '/shipments', icon: Truck },
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
