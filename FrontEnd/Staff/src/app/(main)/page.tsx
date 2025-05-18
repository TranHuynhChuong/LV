'use client';
import AuthGuard from '@/components/guard/AuthGuard';
export default function Home() {
  return (
    <AuthGuard allowedRoles={['']}>
      <div>Trang dành chủ</div>
    </AuthGuard>
  );
}
