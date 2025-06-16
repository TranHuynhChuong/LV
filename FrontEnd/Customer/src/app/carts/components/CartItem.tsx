'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CartItemType } from '@/stores/cart.store';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
export interface ProductInCart extends CartItemType {
  SP_ten: string;
  SP_giaBan: number;
  SP_giaGiam: number;
  SP_anh: string;
  SP_tonKho: number;
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
  const quantity = product.GH_soLuong;

  const handleMinus = () => {
    onQuantityChange(product.SP_id, String(quantity - 1));
  };

  const handleAdd = () => {
    onQuantityChange(product.SP_id, String(quantity + 1));
  };

  return (
    <div className="flex md:items-center flex-col gap-4 md:flex-row  pl-3 pt-2 pb-4 md:pb-2 pr-6 rounded shadow-sm bg-white">
      <div className="flex flex-1 items-center gap-2">
        <Checkbox checked={isSelected} onCheckedChange={onToggle} />
        <div className=" relative w-16 h-16">
          <Image
            src={product.SP_anh}
            alt={product.SP_ten}
            fill
            sizes="64px"
            className=" object-contain"
          />
        </div>
        <div className="flex-1">
          <p className="line-clamp-2 h-[3em] text-sm font-light">{product.SP_ten}</p>
          <div className="flex items-center gap-2 h-fit">
            {product.SP_giaBan !== product.SP_giaGiam ? (
              <div className="flex items-center gap-2 h-fit">
                <span className="text-red-500 font-medium">
                  {product.SP_giaGiam.toLocaleString()}₫
                </span>
                <span className="text-zinc-400 text-xs line-through h-fit">
                  {product.SP_giaBan.toLocaleString()}₫
                </span>
              </div>
            ) : (
              <span className="font-medium">{product.SP_giaBan.toLocaleString()}₫</span>
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
          {(product.SP_giaGiam * quantity).toLocaleString()}₫
        </span>
        <Button size="sm" onClick={() => onRemove(product.SP_id)}>
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}
