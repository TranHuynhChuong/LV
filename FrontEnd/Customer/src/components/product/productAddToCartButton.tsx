'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/stores/cart.store'; // đường dẫn tùy cấu trúc dự án
import api from '@/lib/axiosClient';
import { emitCartChange } from '@/lib/cartEvents';

type Props = {
  inventory: number;
  id: number;
};

export default function AddToCartButton({ inventory, id }: Props) {
  const [quantity, setQuantity] = useState(1);
  const { authData } = useAuth();

  const addToCart = useCartStore((state) => state.addToCart);

  const handleAdd = () => {
    if (quantity < inventory) setQuantity(quantity + 1);
  };

  const handleMinus = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (!authData.userId) {
      addToCart({
        productId: id,
        quantity: quantity,
        dateTime: new Date().toISOString(),
      });
    } else {
      api
        .post('/carts', { KH_id: authData.userId, SP_id: id, GH_soLuong: quantity })
        .then(() => emitCartChange())
        .catch((error) => console.log(error));
    }
  };

  return (
    <div
      className={clsx(
        ' flex items-center bg-white justify-center md:justify-start w-full border-t gap-4 ',
        'md:static md:border-none md:p-0',
        'fixed bottom-0 left-0 right-0 z-20 w-full'
      )}
    >
      <div className="gap-4 flex flex-row md:flex-col">
        {/* Bộ điều khiển số lượng */}
        <div className="flex items-center gap-4 px-0 md:px-2">
          <span className="hidden md:flex text-sm text-zinc-600">Số lượng </span>
          <div className="flex w-fit items-center  border-x md:border-y rounded-none md:rounded-sm border-zinc-300">
            <button
              className="p-2 hover:bg-muted cursor-pointer"
              onClick={handleMinus}
              disabled={quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="min-w-fit w-12 px-2 text-center border-x-1 border-zinc-300">
              {quantity}
            </span>
            <button
              className="p-2 hover:bg-muted cursor-pointer"
              onClick={handleAdd}
              disabled={quantity >= inventory}
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="hidden md:flex text-sm text-zinc-600">{inventory} sản phẩm có sẵn </span>
        </div>

        <div className="flex gap-2 ">
          <Button
            variant="outline"
            className="border-0 cursor-pointer md:border-2 border-zinc-500 rounded-none md:rounded-sm"
            onClick={handleAddToCart}
            disabled={inventory === 0}
          >
            Thêm vào giỏ
          </Button>
          <Button
            className="rounded-none md:rounded-sm cursor-pointer"
            onClick={handleAddToCart}
            disabled={inventory === 0}
          >
            Mua Ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
