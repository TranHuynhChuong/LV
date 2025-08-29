'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Cart } from '@/models/cart';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../ui/badge';

type CartItemProps = {
  cart: Cart;
  isSelected: boolean;
  onToggle: () => void;
  onQuantityChange: (id: number, value: string) => void;
  onRemove: (id: number) => void;
};

export default function CartItem({
  cart,
  isSelected,
  onToggle,
  onQuantityChange,
  onRemove,
}: Readonly<CartItemProps>) {
  const quantity = cart.quantity;

  const handleMinus = () => {
    onQuantityChange(cart.bookId, String(quantity - 1));
  };

  const handleAdd = () => {
    onQuantityChange(cart.bookId, String(quantity + 1));
  };

  const isOutOfStock = quantity === 0;

  return (
    <div className="flex flex-col gap-4 pt-2 pb-4 pl-3 pr-6 bg-white rounded shadow-sm md:items-center md:flex-row md:pb-2">
      <div className="flex items-center flex-1 gap-2">
        <Checkbox checked={isSelected} onCheckedChange={onToggle} disabled={isOutOfStock} />
        <Link href={`/book/${cart.bookId}`}>
          <div className="relative w-16 h-16 ">
            <Image
              src={cart.image}
              alt={cart.title}
              fill
              sizes="64px"
              priority
              className={`object-contain `}
            />
          </div>
        </Link>
        <div className="flex-1">
          <div className="space-y-1">
            <Link href={`/book/${cart.bookId}`}>
              <p
                className={`line-clamp-2 h-[3em] text-sm font-light ${
                  isOutOfStock ? 'text-zinc-400' : ''
                }`}
              >
                {cart.title}
              </p>
            </Link>
          </div>
          <div className="flex items-center gap-2 h-fit">
            {cart.sellingPrice !== cart.purchasePrice ? (
              <div className="flex items-center gap-2 h-fit">
                <span className={`font-medium ${isOutOfStock ? 'text-zinc-400' : 'text-red-500'}`}>
                  {cart.purchasePrice.toLocaleString()}₫
                </span>
                <span
                  className={`text-xs line-through h-fit ${
                    isOutOfStock ? 'text-zinc-300' : 'text-zinc-400'
                  }`}
                >
                  {cart.sellingPrice.toLocaleString()}₫
                </span>
                <Badge variant={isOutOfStock ? 'secondary' : 'destructive'}>
                  {(((cart.sellingPrice - cart.purchasePrice) / cart.sellingPrice) * 100).toFixed(
                    0
                  )}
                  %
                </Badge>
              </div>
            ) : (
              <span className={`font-medium ${isOutOfStock ? 'text-zinc-400' : ''}`}>
                {cart.sellingPrice.toLocaleString()}₫
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-6 pl-4 h-fit">
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`hidden md:flex text-sm ${
              isOutOfStock ? 'text-zinc-400' : 'text-zinc-600 '
            }`}
          >
            Số lượng
          </span>
          <div className="flex items-center border rounded-sm w-fit border-zinc-300">
            <button
              className="p-1 cursor-pointer hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleMinus}
              disabled={isOutOfStock}
            >
              <Minus size={12} />
            </button>
            <span
              className={`min-w-fit w-10 px-2 text-center border-x border-zinc-300 ${
                isOutOfStock ? 'text-zinc-400' : ''
              }`}
            >
              {quantity}
            </span>
            <button
              className="p-1 cursor-pointer hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAdd}
              disabled={isOutOfStock}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
        <span
          className={`w-24 items-center flex-1 text-right ${isOutOfStock ? 'text-zinc-400' : ''}`}
        >
          {(cart.purchasePrice * quantity).toLocaleString()}₫
        </span>
        <Button size="sm" onClick={() => onRemove(cart.bookId)} className="cursor-pointer">
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
