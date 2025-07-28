import '../globals.css';

import { BreadcrumbProvider } from '@/contexts/breadcrumb-context';
import { AuthProvider } from '@/contexts/auth-context';
import LayoutWrapper from '@/components/layout/layout';

export default function MainLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BreadcrumbProvider>
        <LayoutWrapper>{children}</LayoutWrapper>
      </BreadcrumbProvider>
    </AuthProvider>
  );
}
