'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
export default function AuthButtons() {
  const router = useRouter();

  const { authData } = useAuth();

  const isAuthenticated = !!authData.userId;

  const logOut = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.replace('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex space-x-2 justify-end w-full">
        <Button variant="outline" onClick={() => router.push('/auth/login')}>
          Đăng nhập
        </Button>
        <Button onClick={() => router.push('/auth/register')}>Đăng ký</Button>
      </div>
    );
  } else {
    return (
      <div className="flex space-x-2 justify-end w-full">
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => router.push('/profile')}
        >
          <User />
        </Button>
        <Button className="cursor-pointer" onClick={logOut}>
          Đăng xuất
        </Button>
      </div>
    );
  }
}
