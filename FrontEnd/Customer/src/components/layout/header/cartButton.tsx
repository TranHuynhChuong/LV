// components/CartButton.tsx
'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/stores/cart.store';
import { useEffect, useState } from 'react';

export default function CartButton() {
  const router = useRouter();
  const { authData } = useAuth();

  const cartLength = useCartStore((state) => state.carts.length);

  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (authData?.userId == null) {
      // Nếu chưa đăng nhập, tính tổng số lượng sản phẩm từ local store
      setQuantity(cartLength);
    } else {
      // Nếu đã đăng nhập, gọi API hoặc set mặc định là 0 (tuỳ logic của bạn)
      // Giả sử chưa có API thì để tạm là 0
      setQuantity(0);
    }
  }, [authData?.userId, cartLength]);

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
