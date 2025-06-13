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
}: CartItemProps) {
  const quantity = product.GH_soLuong;
  const stock = product.SP_tonKho;

  const handleMinus = () => {
    if (quantity > 1) {
      onQuantityChange(product.SP_id, String(quantity - 1));
    }
  };

  const handleAdd = () => {
    if (quantity < stock) {
      onQuantityChange(product.SP_id, String(quantity + 1));
    }
  };

  return (
    <div className="flex md:items-center flex-col gap-4 md:flex-row border pl-3 pt-2 pb-4 md:pb-2 pr-6 rounded shadow-sm bg-white">
      <div className="flex flex-1 items-center gap-2">
        <Checkbox checked={isSelected} onCheckedChange={onToggle} />
        <Image
          src={product.SP_anh}
          alt={product.SP_ten}
          width={64}
          height={64}
          className="w-16 h-16 object-contain"
        />
        <div className="flex-1">
          <p className=" line-clamp-2 h-[3em]">{product.SP_ten}</p>
          <span className="flex flex-col gap-2">
            {product.SP_giaBan != product.SP_giaGiam && (
              <p className="text-zinc-400 text-xs line-through">
                {product.SP_giaBan.toLocaleString()}₫
              </p>
            )}
            <p className="text-red-500">{product.SP_giaGiam.toLocaleString()}₫</p>
          </span>
        </div>
      </div>
      <div className="flex justify-end h-fit items-center gap-6 pl-4">
        <div className="flex items-center gap-2 mt-1">
          <span className="hidden md:flex text-sm text-zinc-600">Số lượng</span>
          <div className="flex w-fit items-center border rounded-sm border-zinc-300">
            <button
              className="p-1 hover:bg-muted cursor-pointer disabled:opacity-50"
              onClick={handleMinus}
              disabled={quantity <= 1}
            >
              <Minus size={12} />
            </button>
            <span className="min-w-fit w-10 px-2 text-center border-x border-zinc-300">
              {quantity}
            </span>
            <button
              className="p-1 hover:bg-muted cursor-pointer disabled:opacity-50"
              onClick={handleAdd}
              disabled={quantity >= stock}
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
