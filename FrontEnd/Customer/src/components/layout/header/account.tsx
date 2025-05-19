'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import Link from 'next/link';

export default function Account() {
  const [isHydrated, setIsHydrated] = useState(false);
  const userId = null;

  useEffect(() => {
    setIsHydrated(true); // đánh dấu đã hydrate xong
  }, []);

  return (
    <Link
      href="/auth/login"
      className="  cursor-pointer w-fit h-full flex flex-col items-center justify-center bg-transparent border-none p-0"
    >
      <User size={28} color="white" />
      <p className="hidden md:flex text-sm text-white">Tài khoản</p>
    </Link>
  );
}
