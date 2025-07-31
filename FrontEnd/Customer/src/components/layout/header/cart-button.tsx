'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import { subscribeToCartChange } from '@/lib/cart-events';
import { useCartStore } from '@/stores/cart.store';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function CartButton() {
  const router = useRouter();
  const { authData } = useAuth();
  const guestCartLength = useCartStore((state) => state.carts.length);
  const [quantity, setQuantity] = useState(0);

  const updateQuantity = useCallback(() => {
    if (!authData.userId) {
      setQuantity(guestCartLength);
    } else {
      api
        .get(`/carts/${authData.userId}`)
        .then((res) => setQuantity(res.data.length))
        .catch(() => setQuantity(0));
    }
  }, [authData.userId, guestCartLength]);

  useEffect(() => {
    updateQuantity();
    const unsubscribe = subscribeToCartChange(updateQuantity);
    return () => {
      unsubscribe();
    };
  }, [authData.userId, guestCartLength]);

  return (
    <Button
      variant="outline"
      className="relative cursor-pointer"
      onClick={() => router.push('/cart')}
    >
      <ShoppingCart className="w-5 h-5" />
      {quantity > 0 && (
        <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-2 -right-2">
          {quantity}
        </span>
      )}
    </Button>
  );
}
