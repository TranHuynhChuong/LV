'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CartItemType } from '@/stores/cart.store';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

export interface ProductInCart extends CartItemType {
  name: string;
  price: number;
  salePrice: number;
  cost: number;
  cover: string;
  stock: number;
  weight: number;
}

interface CartItemProps {
  product: ProductInCart;
  isSelected: boolean;
  onToggle: () => void;
  onQuantityChange: (id: number, value: string) => void;
  onRemove: (id: number) => void;
}

export default function CartItem({
  product,
  isSelected,
  onToggle,
  onQuantityChange,
  onRemove,
}: Readonly<CartItemProps>) {
  const quantity = product.quantity;

  const handleMinus = () => {
    onQuantityChange(product.productId, String(quantity - 1));
  };

  const handleAdd = () => {
    onQuantityChange(product.productId, String(quantity + 1));
  };

  return (
    <div className="flex md:items-center flex-col gap-4 md:flex-row  pl-3 pt-2 pb-4 md:pb-2 pr-6 rounded shadow-sm bg-white">
      <div className="flex flex-1 items-center gap-2">
        <Checkbox checked={isSelected} onCheckedChange={onToggle} />
        <div className=" relative w-16 h-16">
          <Image
            src={product.cover}
            alt={product.name}
            fill
            sizes="64px"
            priority
            className=" object-contain"
          />
        </div>
        <div className="flex-1">
          <p className="line-clamp-2 h-[3em] text-sm font-light">{product.name}</p>
          <div className="flex items-center gap-2 h-fit">
            {product.price !== product.salePrice ? (
              <div className="flex items-center gap-2 h-fit">
                <span className="text-red-500 font-medium">
                  {product.salePrice.toLocaleString()}₫
                </span>
                <span className="text-zinc-400 text-xs line-through h-fit">
                  {product.price.toLocaleString()}₫
                </span>
              </div>
            ) : (
              <span className="font-medium">{product.price.toLocaleString()}₫</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end h-fit items-center gap-6 pl-4">
        <div className="flex items-center gap-2 mt-1">
          <span className="hidden md:flex text-sm text-zinc-600">Số lượng</span>
          <div className="flex w-fit items-center border rounded-sm border-zinc-300">
            <button
              className="p-1 hover:bg-muted cursor-pointer disabled:opacity-50"
              onClick={handleMinus}
            >
              <Minus size={12} />
            </button>
            <span className="min-w-fit w-10 px-2 text-center border-x border-zinc-300">
              {quantity}
            </span>
            <button
              className="p-1 hover:bg-muted cursor-pointer disabled:opacity-50"
              onClick={handleAdd}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
        <span className="w-24 items-center flex-1 text-right">
          {(product.salePrice * quantity).toLocaleString()}₫
        </span>
        <Button size="sm" onClick={() => onRemove(product.productId)}>
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
