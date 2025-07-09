'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/stores/cart.store'; // đường dẫn tùy cấu trúc dự án
import api from '@/lib/axios';
import { emitCartChange } from '@/lib/cartEvents';
import Link from 'next/link';
import { toast } from 'sonner';
import eventBus from '@/lib/eventBus';
import { useRouter } from 'next/navigation';

type Props = {
  inventory: number;
  id: number;
};

export default function AddToCartButton({ inventory, id }: Props) {
  const [quantity, setQuantity] = useState(1);
  const { authData } = useAuth();
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);
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
      if (authData.userId) {
        const res = await api.get(`/carts/${authData.userId}`);
        emitCartChange();
        if (res.data.length > 99) {
          toast.error('Vui lòng xóa bớt sản phẩm trong giỏ hàng');
          return;
        }
      }
      const res = await api.post('/carts', {
        KH_id: authData.userId ?? -1,
        SP_id: id,
        GH_soLuong: quantity,
      });

      const data = res.data;
      if (data && data.length === 0) {
        if (carts.length > 99) {
          toast.error('Vui lòng xóa bớt sản phẩm trong giỏ hàng');
          return;
        }

        addToCart({
          productId: id,
          quantity: quantity,
          dateTime: new Date().toISOString(),
        });
      }

      toast.success('Sản phẩm đã thêm vào giỏ hàng');
      emitCartChange();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const status = error?.response?.status;

      switch (status) {
        case 404:
          toast.error('Sản phẩm không tồn tại');
          router.back();
          break;
        case 409:
          toast.error('Số lượng tồn kho không đủ');
          break;
        default:
          toast.error('Thêm giỏ hàng thất bại');
      }
    } finally {
      eventBus.emit('reloadProduct');
    }
  };

  return (
    <div
      className={clsx(
        ' flex items-center bg-white justify-center md:justify-start w-full border-t gap-4 ',
        'md:static md:border-none md:p-0',
        'fixed bottom-0 left-0 right-0 z-50 w-full'
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
          <Link href={`/carts?id=${id}`}>
            <Button
              className="rounded-none md:rounded-sm cursor-pointer"
              onClick={handleAddToCart}
              disabled={inventory === 0}
            >
              Mua Ngay
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
