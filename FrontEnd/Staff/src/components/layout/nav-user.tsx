'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { BadgeCheck, ChevronsUpDown, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NavUser({
  user,
}: Readonly<{
  user: {
    role: number | null;
    code: string | null;
  };
}>) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/login');
  };

  const roleText = (role: number | null) => {
    switch (role) {
      case 1:
        return 'Quản trị';
      case 2:
        return 'Quản lý';
      case 3:
        return 'Bán hàng';
      default:
        return 'Không xác định';
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer "
            >
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-semibold truncate">{roleText(user.role)}</span>
                <span className="text-xs truncate">{user.code}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="grid flex-1 ml-4 text-sm leading-tight text-left">
                  <span className="font-semibold truncate">{roleText(user.role)}</span>
                  <span className="text-xs truncate">{user.code}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" onSelect={() => router.push('/profile')}>
                <BadgeCheck />
                Hồ sơ
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onSelect={handleLogout}>
              <LogOut />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
