'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-white text-center relative overflow-hidden">
      {/* Số 404 to ở giữa */}
      <div className="flex text-9xl md:text-[220px] font-extrabold text-gray-700 space-x-4 mb-4">
        {['4', '0', '4'].map((char, idx) => (
          <motion.div
            key={idx}
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 2 + idx * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {char}
          </motion.div>
        ))}
      </div>

      {/* Ảnh GIF con vịt đi đè lên số 404 */}
      <img
        src="/not-found.gif"
        alt="not-found"
        className="absolute top-1/2 left-1/2 w-[180px] h-auto transform -translate-x-1/2 -translate-y-1/2 z-10"
      />

      {/* Nội dung */}
      <p className="mt-46 md:mt-32 text-lg text-gray-600 z-20">Trang bạn đang tìm không tồn tại.</p>

      <Link href="/">
        <Button className="mt-4 z-20 cursor-pointer">Về trang chủ</Button>
      </Link>
    </div>
  );
}
