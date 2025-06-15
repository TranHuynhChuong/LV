// components/CartButton.tsx
'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/stores/cart.store';
import { useEffect, useState } from 'react';
import api from '@/lib/axiosClient';
import { subscribeToCartChange } from '@/lib/cartEvents';

export default function CartButton() {
  const router = useRouter();
  const { authData } = useAuth();
  const guestCartLength = useCartStore((state) => state.carts.length);
  const [quantity, setQuantity] = useState(0);

  // Function dùng chung để cập nhật số lượng
  const updateQuantity = () => {
    if (!authData.userEmail) {
      setQuantity(guestCartLength);
    } else {
      api
        .get(`/carts/${authData.userEmail}`)
        .then((res) => setQuantity(res.data.length))
        .catch(() => setQuantity(0));
    }
  };

  useEffect(() => {
    updateQuantity(); // Lần đầu tiên mount

    const unsubscribe = subscribeToCartChange(updateQuantity); // Lắng nghe sự kiện
    return () => {
      unsubscribe();
    }; // Cleanup khi unmount
  }, [authData.userEmail, guestCartLength]);

  return (
    <Button
      variant="outline"
      className="relative cursor-pointer"
      onClick={() => router.push('/carts')}
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
