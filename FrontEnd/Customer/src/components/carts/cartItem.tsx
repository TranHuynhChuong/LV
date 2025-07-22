'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Cart } from '@/models/carts';
import { Badge } from '../ui/badge';
import Link from 'next/link';

interface CartItemProps {
  cart: Cart;
  isSelected: boolean;
  onToggle: () => void;
  onQuantityChange: (id: number, value: string) => void;
  onRemove: (id: number) => void;
}

export default function CartItem({
  cart,
  isSelected,
  onToggle,
  onQuantityChange,
  onRemove,
}: Readonly<CartItemProps>) {
  const quantity = cart.quantity;

  const handleMinus = () => {
    onQuantityChange(cart.productId, String(quantity - 1));
  };

  const handleAdd = () => {
    onQuantityChange(cart.productId, String(quantity + 1));
  };

  const isOutOfStock = quantity === 0;

  return (
    <div className="flex md:items-center flex-col gap-4 md:flex-row  pl-3 pt-2 pb-4 md:pb-2 pr-6 rounded shadow-sm bg-white">
      <div className="flex flex-1 items-center gap-2">
        <Checkbox checked={isSelected} onCheckedChange={onToggle} disabled={isOutOfStock} />
        <Link href={`/product/${cart.productId}`}>
          <div className=" relative w-16 h-16">
            <Image
              src={cart.cover}
              alt={cart.name}
              fill
              sizes="64px"
              priority
              className={`object-contain `}
            />
          </div>
        </Link>
        <div className="flex-1">
          <div className="space-y-1">
            <Link href={`/product/${cart.productId}`}>
              <p
                className={`line-clamp-2 h-[3em] text-sm font-light ${
                  isOutOfStock ? 'text-zinc-400' : ''
                }`}
              >
                {cart.name}
              </p>
            </Link>
          </div>
          <div className="flex items-center gap-2 h-fit">
            {cart.isOnSale ? (
              <div className="flex items-center gap-2 h-fit">
                <span className={`font-medium ${isOutOfStock ? 'text-zinc-400' : 'text-red-500'}`}>
                  {cart.discountPrice.toLocaleString()}₫
                </span>
                <span
                  className={`text-xs line-through h-fit ${
                    isOutOfStock ? 'text-zinc-300' : 'text-zinc-400'
                  }`}
                >
                  {cart.salePrice.toLocaleString()}₫
                </span>
                <Badge variant={isOutOfStock ? 'secondary' : 'destructive'}>
                  {cart.discountPercent}%
                </Badge>
              </div>
            ) : (
              <span className={`font-medium ${isOutOfStock ? 'text-zinc-400' : ''}`}>
                {cart.salePrice.toLocaleString()}₫
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end h-fit items-center gap-6 pl-4">
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`hidden md:flex text-sm ${
              isOutOfStock ? 'text-zinc-400' : 'text-zinc-600 '
            }`}
          >
            Số lượng
          </span>
          <div className="flex w-fit items-center border rounded-sm border-zinc-300">
            <button
              className="p-1 hover:bg-muted cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="p-1 hover:bg-muted cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          {(cart.discountPrice * quantity).toLocaleString()}₫
        </span>
        <Button size="sm" onClick={() => onRemove(cart.productId)} className="cursor-pointer">
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
