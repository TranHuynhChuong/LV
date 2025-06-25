// components/Overlay.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Overlay({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 h-screen w-full">{children}</div>,
    document.body
  );
}
