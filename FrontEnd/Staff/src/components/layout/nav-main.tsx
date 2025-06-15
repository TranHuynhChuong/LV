import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { LucideIcon } from 'lucide-react';

type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: {
    title: string;
    url: string;
  }[];
};

export function NavMain({
  navMain,
}: {
  navMain: NavItem[];
} & React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navMain.map((item) => {
          const isActive =
            item.url !== '/' ? pathname.includes(item.url) && !item.items : pathname === item.url;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={` ${
                  isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold' : ''
                }`}
              >
                <Link href={item.url} className="flex items-center gap-2 w-full  cursor-pointer">
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>

              {item.items?.length ? (
                <SidebarMenuSub className="pr-0 mr-0">
                  {item.items.map((sub) => {
                    const isSubActive = pathname.includes(sub.url);
                    return (
                      <SidebarMenuSubItem key={sub.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={`h-fit py-1 px-2 ${
                            isSubActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                              : ''
                          }`}
                        >
                          <Link href={sub.url} className="">
                            {sub.title}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              ) : null}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
