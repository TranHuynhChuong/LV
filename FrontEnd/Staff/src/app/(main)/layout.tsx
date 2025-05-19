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

import { BreadcrumbProvider, useBreadcrumb } from '@/context/BreadcrumbContext';
import AuthGuard from '@/components/guard/AuthGuard';

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
    <AuthGuard allowedRoles={[]}>
      <BreadcrumbProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-white">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <AppBreadcrumb />
            </header>
            <main className="flex flex-1 bg-zinc-100 p-4">{children}</main>
            <Toaster richColors position="bottom-right" duration={1000} />
          </SidebarInset>
        </SidebarProvider>
      </BreadcrumbProvider>
    </AuthGuard>
  );
}
