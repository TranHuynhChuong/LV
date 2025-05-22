// components/AuthButtons.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AuthButtons() {
  const router = useRouter();

  return (
    <div className="flex space-x-4 justify-end w-full">
      <Button variant="outline" onClick={() => router.push('/auth/login')}>
        Đăng nhập
      </Button>
      <Button onClick={() => router.push('/auth/register')}>Đăng ký</Button>
    </div>
  );
}
