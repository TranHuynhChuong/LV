'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden text-center bg-white">
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
      <Image
        src="/not-found.gif"
        alt="not-found"
        width={180}
        height={180}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-[180px] h-auto"
      />

      <p className="z-20 text-lg text-gray-600 mt-46 md:mt-32">Trang bạn đang tìm không tồn tại.</p>
      <Link href="/">
        <Button className="z-20 mt-4 cursor-pointer">Về trang chủ</Button>
      </Link>
    </div>
  );
}
