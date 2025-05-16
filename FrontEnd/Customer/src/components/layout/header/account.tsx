'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Account() {
  const [open, setOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false); // <- NEW
  const userId = useAuthStore((state) => state.userId);

  useEffect(() => {
    setIsHydrated(true); // đánh dấu đã hydrate xong
  }, []);

  const showMenu = isHydrated && !userId;
  return (
    <button
      type="button"
      className="group cursor-pointer  bg-transparent border-none p-0 h-full w-fit flex flex-col justify-center items-center "
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setOpen((prev) => !prev);
        }
      }}
    >
      <User size={28} color="white" />
      <p className="hidden md:flex text-sm text-white">Tài khoản</p>

      {showMenu && open && (
        <div className="absolute top-full right-0 z-50 px-4 w-fit hidden md:block">
          <div className="bg-zinc-800 text-white shadow-lg rounded-b-md text-left overflow-hidden flex flex-col">
            <Link href="/login" className=" hover:bg-zinc-700 py-2 px-6">
              Đăng nhập
            </Link>
            <Link href="/register" className=" hover:bg-zinc-700 py-2 px-6 ">
              Đăng ký
            </Link>
          </div>

          <div className="absolute top-[-8px] left-0 h-2 w-full bg-transparent" />
        </div>
      )}
    </button>
  );
}
