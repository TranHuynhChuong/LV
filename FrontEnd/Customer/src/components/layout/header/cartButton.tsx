// components/CartButton.tsx
'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface CartButtonProps {
  quantity?: number;
}

export default function CartButton({ quantity = 0 }: CartButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="relative cursor-pointer"
      onClick={() => router.push('/cart')}
    >
      <ShoppingCart className="w-5 h-5" />
      {quantity > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {quantity}
        </span>
      )}
    </Button>
  );
}
