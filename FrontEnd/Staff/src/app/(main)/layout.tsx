'use client';
import '../globals.css';
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

import { Skeleton } from '@/components/ui/skeleton';

function AppBreadcrumb() {
  const { breadcrumbs } = useBreadcrumb();

  const isLoading = breadcrumbs.length === 0;

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex items-center space-x-2">
        {isLoading ? (
          <Skeleton className="h-6 rounded-md w-52" />
        ) : (
          breadcrumbs.map((crumb, index) => (
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
          ))
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default function MainLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BreadcrumbProvider>
        <SidebarProvider className="h-screen">
          <AppSidebar />
          <SidebarInset>
            <header className="sticky top-0 z-40 flex items-center h-16 gap-2 px-4 bg-white border-b shrink-0">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-4 mr-2" />
              <AppBreadcrumb />
            </header>

            <main className="w-full h-full p-4 overflow-auto bg-zinc-100">{children}</main>

            <Toaster richColors position="bottom-right" duration={2000} />
          </SidebarInset>
        </SidebarProvider>
      </BreadcrumbProvider>
    </AuthProvider>
  );
}
