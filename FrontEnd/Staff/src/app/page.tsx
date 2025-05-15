'use client';
import { AuthGuard } from '@/components/guard/AuthGuard';

export default function Home() {
  return (
    <AuthGuard role="admin">
      <div>Chỉ hiển thị nếu đã login và đúng role</div>
    </AuthGuard>
  );
}
