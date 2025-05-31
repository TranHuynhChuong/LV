'use client';

import { useState } from 'react';
import { LayoutList } from 'lucide-react';

export default function CategoryList() {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      className="group cursor-pointer w-fit h-full flex justify-center items-center bg-transparent border-none p-0"
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
      <LayoutList size={28} color="white" />

      {open && (
        <div className="absolute top-full left-0 z-50 px-4 w-full hidden md:block">
          <div className="bg-zinc-800 text-white p-4 shadow-lg rounded-b-md">
            <div className="font-semibold mb-4">Danh mục</div>
            <ul className="space-y-1 text-sm">
              <li>Sách Văn Học</li>
              <li>Sách Khoa Học</li>
              <li>Sách Kỹ Năng</li>
              <li>Sách Thiếu Nhi</li>
            </ul>
          </div>

          <div className="absolute top-[-8px] left-0 h-2 w-full bg-transparent" />
        </div>
      )}
    </button>
  );
}
