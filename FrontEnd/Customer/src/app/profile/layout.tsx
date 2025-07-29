import ProfileSidebar from '@/components/profile/profile-sidebar';
import { ReactNode } from 'react';

export default function ProfileLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="space-y-4 lg:flex lg:space-x-4 lg:space-y-0">
      <ProfileSidebar />
      <div className="flex flex-1 min-w-0">{children}</div>
    </div>
  );
}
