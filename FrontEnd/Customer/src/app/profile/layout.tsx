// app/profile/layout.tsx
'use client';
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileSidebar } from './profileSideBar';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const { authData } = useAuth();

  if (!authData.userId) return <div>Đang tải...</div>;

  return (
    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
      {/* Sidebar - ẩn trên mobile, hiện trên md+ */}
      <ProfileSidebar />

      <div className="flex-1">{children}</div>
    </div>
  );
}
