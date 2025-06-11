'use client';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { UseFormWatch, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { ProductPromotionFormType } from './ProductPromotionForm';
import { ProductSimple } from '@/type/Product';

interface Props {
  products?: ProductSimple[];
  detail?: {
    productId: number;
    isPercent: boolean;
    value: number;
    isBlocked: boolean;
  }[];
  watch: UseFormWatch<ProductPromotionFormType>;
  register: UseFormRegister<ProductPromotionFormType>;
  setValue: UseFormSetValue<ProductPromotionFormType>;
  onRemove?: (id: number) => void;
  isViewing?: boolean;
}

export default function ProductDiscountTable({
  products,
  detail,
  watch,
  register,
  setValue,
  onRemove,
  isViewing,
}: Props) {
  function calcFinalPrice(price: number, value: number, isPercent: boolean): number {
    if (isPercent) {
      return Math.max(0, price - (value / 100) * price);
    }
    return Math.max(0, price - value);
  }
  const mergedData = detail?.map((item) => {
    const product = products?.find((p) => p.id === item.productId);
    return {
      detail: item,
      product,
    };
  });
  if (mergedData?.length === 0) return null;
  else {
    return (
      <div className="overflow-x-auto max-w-full bg-white rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow className="text-center">
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Giá gốc</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead>Giảm</TableHead>
              <TableHead>Kiểu</TableHead>
              <TableHead>Giá sau giảm</TableHead>
              <TableHead>Tồn kho</TableHead>
              <TableHead>Khóa</TableHead>
              <TableHead>Xóa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mergedData?.map(({ detail: item, product }, index) => {
              if (!product) return null;
              const isBlocked = watch(`detail.${index}.isBlocked`) ?? false;
              const isPercent = watch(`detail.${index}.isPercent`) ?? true;
              const rawValue = watch(`detail.${index}.value`);
              const value = isNaN(Number(rawValue)) ? 0 : Number(rawValue);

              const valuePath = `detail.${index}.value` as const;
              const blockedPath = `detail.${index}.isBlocked` as const;
              const percentPath = `detail.${index}.isPercent` as const;
              const idPath = `detail.${index}.productId` as const;

              return (
                <TableRow key={item.productId} className="align-middle">
                  <TableCell>
                    <input type="hidden" {...register(idPath)} value={item.productId} />
                    <div className="flex items-center gap-2 max-w-64 min-w-42">
                      <Avatar className="w-10 h-10 rounded-sm">
                        <AvatarImage src={product.image} alt={product.name} />
                        <AvatarFallback>#{product.id}</AvatarFallback>
                      </Avatar>
                      <div className="w-full">
                        <div className="truncate cursor-default w-full">{product.name}</div>
                        <div className="text-xs text-muted-foreground">#{product.id}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      value={product.cost}
                      disabled
                      className="max-w-32 min-w-24 disabled:opacity-80"
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      value={product.price}
                      disabled
                      className="max-w-32 min-w-24  disabled:opacity-80"
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      disabled={isBlocked || isViewing}
                      min={0}
                      value={rawValue ?? 0}
                      onChange={(e) => setValue(valuePath, Number(e.target.value))}
                      className="max-w-32 min-w-24"
                    />
                  </TableCell>

                  <TableCell>
                    <Select
                      disabled={isBlocked || isViewing}
                      onValueChange={(val) => setValue(percentPath, val === 'percent')}
                      value={isPercent ? 'percent' : 'amount'}
                    >
                      <SelectTrigger className="w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-16">
                        <SelectItem value="percent">%</SelectItem>
                        <SelectItem value="amount">₫</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      disabled
                      value={calcFinalPrice(product.price, value, isPercent)}
                      className="max-w-32 min-w-24  disabled:opacity-80"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={product.stock}
                      disabled
                      className="max-w-32 min-w-24 disabled:opacity-80"
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center ">
                      <Switch
                        checked={isBlocked}
                        onCheckedChange={(val) => setValue(blockedPath, val)}
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => onRemove?.(product.id)}
                      size="icon"
                      disabled={isViewing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
}
