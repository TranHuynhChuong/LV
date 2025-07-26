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
import { BookPromotionDetail } from '@/models/promotionBook';
import { BookOverView } from '@/models/books';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type BookDiscountTableProps = {
  books?: BookOverView[];
  detail?: {
    bookId: number;
    isPercent: boolean;
    value: number;
    isBlocked: boolean;
  }[];
  watch: UseFormWatch<BookPromotionDetail>;
  register: UseFormRegister<BookPromotionDetail>;
  setValue: UseFormSetValue<BookPromotionDetail>;
  onRemove?: (id: number) => void;
  isViewing?: boolean;
};

export default function BookDiscountTable({
  books,
  detail,
  watch,
  register,
  setValue,
  onRemove,
  isViewing = false,
}: Readonly<BookDiscountTableProps>) {
  function calcFinalPrice(price: number, value: number, isPercent: boolean): number {
    if (isPercent) {
      return Math.max(0, price - (value / 100) * price);
    }
    return Math.max(0, price - value);
  }
  const mergedData = detail?.map((item) => {
    const book = books?.find((p) => p.id === item.bookId);
    return {
      detail: item,
      book,
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
            {mergedData?.map(({ detail: item, book }, index) => {
              if (!book) return null;
              const isBlocked = watch(`details.${index}.isBlocked`) ?? false;
              const isPercent = watch(`details.${index}.isPercent`) ?? true;
              const rawValue = watch(`details.${index}.value`);
              const value = isNaN(Number(rawValue)) ? 0 : Number(rawValue);

              const valuePath = `details.${index}.value` as const;
              const blockedPath = `details.${index}.isBlocked` as const;
              const percentPath = `details.${index}.isPercent` as const;
              const idPath = `details.${index}.bookId` as const;

              return (
                <TableRow key={item.bookId} className="align-middle">
                  <TableCell>
                    <input type="hidden" {...register(idPath)} value={item.bookId} />
                    <div className="flex  gap-2 ">
                      <Avatar className="w-10 h-10 rounded-sm">
                        <AvatarImage src={book.image} alt={book.name} />
                        <AvatarFallback>#{book.id}</AvatarFallback>
                      </Avatar>
                      <div className="max-w-48 min-w-32">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-xs cursor-default truncate">{book.name}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p> {book.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <div className="text-xs text-muted-foreground">#{book.id}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      value={book.costPrice}
                      disabled
                      className="max-w-32 min-w-24 disabled:opacity-80"
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      value={book.salePrice}
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
                      <SelectTrigger className="w-16 cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-16 ">
                        <SelectItem value="percent" className="cursor-pointer">
                          %
                        </SelectItem>
                        <SelectItem value="amount" className="cursor-pointer">
                          ₫
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      disabled
                      value={calcFinalPrice(book.salePrice, value, isPercent)}
                      className="max-w-32 min-w-24  disabled:opacity-80"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={book.inventory}
                      disabled
                      className="max-w-32 min-w-24 disabled:opacity-80"
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center ">
                      <Switch
                        className="cursor-pointer"
                        checked={isBlocked}
                        onCheckedChange={(val) => setValue(blockedPath, val)}
                        disabled={isViewing}
                      />
                    </div>
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => onRemove?.(book.id)}
                      size="icon"
                      className="cursor-pointer"
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
