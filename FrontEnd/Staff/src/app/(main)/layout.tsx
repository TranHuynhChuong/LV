'use client';

import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { BreadcrumbProvider, useBreadcrumb } from '@/contexts/BreadcrumbContext';
import { AuthProvider } from '@/contexts/AuthContext';

function AppBreadcrumb() {
  const { breadcrumbs } = useBreadcrumb();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <BreadcrumbList key={index} className="flex items-center">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default function MainLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BreadcrumbProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="sticky top-0 flex items-center h-16 gap-2 px-4 bg-white border-b shrink-0 z-40">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-4 mr-2" />
              <AppBreadcrumb />
            </header>
            <main className="flex flex-1 p-4 bg-zinc-100">{children}</main>
            <Toaster richColors position="bottom-right" duration={2000} />
          </SidebarInset>
        </SidebarProvider>
      </BreadcrumbProvider>
    </AuthProvider>
  );
}
