'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthButtons() {
  const router = useRouter();
  const { authData, loadAuth } = useAuth();
  const isAuthenticated = !!authData.userId;
  const logOut = async () => {
    await fetch('/api/logout', { method: 'POST' });
    await loadAuth();
    router.replace('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-end w-full space-x-2">
        <Button variant="outline" onClick={() => router.push('/login')} className="cursor-pointer">
          Đăng nhập
        </Button>
        <Button
          className="cursor-pointer "
          onClick={() => {
            router.push('/register');
          }}
        >
          Đăng ký
        </Button>
      </div>
    );
  } else {
    return (
      <div className="flex justify-end w-full space-x-2">
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
