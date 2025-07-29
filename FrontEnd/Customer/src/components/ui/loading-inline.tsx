'use client';

import { Loader2 } from 'lucide-react';

type Props = {
  label?: string;
  height?: string;
};

export default function LoadingInline({ label = 'Đang tải...', height = 'h-20' }: Readonly<Props>) {
  return (
    <div className={`${height} flex items-center justify-center gap-2 text-gray-600`}>
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <span>{label}</span>
    </div>
  );
}
