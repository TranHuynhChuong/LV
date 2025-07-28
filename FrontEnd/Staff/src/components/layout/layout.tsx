'use client';

import { useEffect, useRef, useState } from 'react';
import { SidebarTrigger, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { AppSidebar } from './app-sidebar';
import { Toaster } from 'sonner';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

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
            <BreadcrumbList key={index} className="flex items-center flex-nowrap">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {crumb.href ? (
                  <BreadcrumbLink className=" whitespace-nowrap" href={crumb.href}>
                    {crumb.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className=" whitespace-nowrap">{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </BreadcrumbList>
          ))
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const isMdUp = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    if (!sidebarRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSidebarWidth(entry.contentRect.width);
      }
    });

    observer.observe(sidebarRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <SidebarProvider>
      <div ref={sidebarRef}>
        <AppSidebar />
      </div>
      <SidebarInset>
        <header className="sticky top-0 flex items-center gap-2 p-4 bg-white border-b min-h-16 max-h-fit shrink-0 ">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mr-2" />
          <AppBreadcrumb />
        </header>
        <main
          className="flex-col flex-1 overflow-auto bg-zinc-100"
          style={isMdUp ? { maxWidth: `calc(100vw - ${sidebarWidth}px)` } : { maxWidth: '100%' }}
        >
          {children}
        </main>

        <Toaster richColors position="bottom-right" duration={2000} />
      </SidebarInset>
    </SidebarProvider>
  );
}
