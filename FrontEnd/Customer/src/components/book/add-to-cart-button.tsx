'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import api from '@/lib/axios-client';
import { emitCartChange } from '@/lib/cart-events';
import { useCartStore } from '@/stores/cart.store';
import clsx from 'clsx';
import { Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  inventory: number;
  id: number;
};

export default function AddToCartButton({ inventory, id }: Readonly<Props>) {
  const [quantity, setQuantity] = useState(1);
  const { authData } = useAuth();
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
  const replaceCart = useCartStore((state) => state.replaceCart);
  const carts = useCartStore((state) => state.carts);

  const handleAdd = () => {
    if (quantity < inventory) setQuantity(quantity + 1);
  };

  const handleMinus = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      const res = await api.post('/carts', {
        customerId: authData.userId ?? -1,
        bookId: id,
        quantity: quantity,
      });

      const data = res.data;
      if (data && data.length === 0) {
        const response = await api.post('/carts/get-carts', carts);
        const validProducts = response.data.filter(Boolean);
        replaceCart(validProducts);

        if (validProducts.length >= 99) {
          toast.error('Vui lòng xóa bớt sách trong giỏ hàng');
          return;
        }

        addToCart({
          bookId: id,
          quantity: quantity,
          addedAt: new Date().toISOString(),
        });
      }
      toast.success('Sách đã thêm vào giỏ hàng');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const status = error?.response?.status;
      switch (status) {
        case 404:
          toast.error('Sách không tồn tại');
          router.back();
          break;
        case 409:
          toast.error('Vui lòng xóa bớt sách trong giỏ hàng');
          break;
        default:
          toast.error('Thêm giỏ hàng thất bại');
      }
    } finally {
      router.refresh();
      emitCartChange();
    }
  };

  return (
    <div
      className={clsx(
        'flex items-center bg-white justify-center md:justify-start w-full border-t gap-4 ',
        'md:static md:border-none md:p-0',
        'fixed bottom-0 left-0 right-0 z-50 w-full'
      )}
    >
      <div className="flex flex-row gap-4 md:flex-col">
        <div className="flex items-center gap-4 px-0 md:px-2">
          <span className="hidden text-sm md:flex text-zinc-600">Số lượng </span>
          <div className="flex items-center rounded-none w-fit border-x md:border-y md:rounded-sm border-zinc-300">
            <button
              className="p-2 cursor-pointer hover:bg-muted"
              onClick={handleMinus}
              disabled={quantity <= 1}
            >
              <Minus size={14} />
            </button>
            <span className="w-12 px-2 text-center min-w-fit border-x-1 border-zinc-300">
              {quantity}
            </span>
            <button
              className="p-2 cursor-pointer hover:bg-muted"
              onClick={handleAdd}
              disabled={quantity >= inventory}
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="hidden text-sm md:flex text-zinc-600">{inventory} sách có sẵn </span>
        </div>

        <div className="flex gap-2 ">
          <Button
            variant="outline"
            className="border-0 rounded-none cursor-pointer md:border-2 border-zinc-700 md:rounded-sm hover:border-zinc-600 text-zinc-700 hover:text-zinc-600"
            onClick={handleAddToCart}
          >
            Thêm vào giỏ hàng
          </Button>
          {inventory === 0 ? (
            <Button className="rounded-none cursor-not-allowed md:rounded-sm" disabled>
              Mua Ngay
            </Button>
          ) : (
            <Button
              className="rounded-none cursor-pointer md:rounded-sm "
              onClick={async () => {
                await handleAddToCart();
                router.push(`/cart?id=${id}`);
              }}
            >
              Mua Ngay
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
