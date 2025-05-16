'use client';

import { AuthGuard } from '@/components/guard/AuthGuard';

export default function Home() {
  return (
    <AuthGuard allowedRoles={['Admin', 'Staff']}>
      <div>Chỉ hiển thị nếu đã login và đúng role</div>
    </AuthGuard>
  );
}
