import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';

export default function MainLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        <SidebarTrigger />
        <div className="flex flex-1">{children}</div>
      </main>
    </SidebarProvider>
  );
}
