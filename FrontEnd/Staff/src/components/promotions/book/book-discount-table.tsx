'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BookOverView } from '@/models/books';
import { BookPromotionDetail } from '@/models/promotionBook';
import { Trash2 } from 'lucide-react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';

type Props = {
  books?: BookOverView[];
  detail?: {
    bookId: number;
    isPercent: boolean;
    value: number;
    isBlocked: boolean;
    salePrice?: number;
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
}: Readonly<Props>) {
  function calcFinalPrice(price: number, value: number, isPercent: boolean): number {
    let salePrice: number;
    if (isPercent) {
      salePrice = Math.max(0, price - (value / 100) * price);
    }
    salePrice = Math.max(0, price - value);
    return salePrice;
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
      <div className="max-w-full overflow-x-auto bg-white border rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="text-center">
              <TableHead>Sách</TableHead>
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
              const salePricePath = `details.${index}.salePrice` as const;
              const valuePath = `details.${index}.value` as const;
              const blockedPath = `details.${index}.isBlocked` as const;
              const percentPath = `details.${index}.isPercent` as const;
              const idPath = `details.${index}.bookId` as const;

              return (
                <TableRow key={item.bookId} className="align-middle">
                  <TableCell>
                    <input type="hidden" {...register(idPath)} value={item.bookId} />
                    <div className="flex gap-2 ">
                      <Avatar className="w-10 h-10 rounded-sm">
                        <AvatarImage src={book.image} alt={book.name} />
                        <AvatarFallback>#{book.id}</AvatarFallback>
                      </Avatar>
                      <div className="max-w-48 min-w-32">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-xs truncate cursor-default">{book.name}</div>
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
                      className="max-w-32 min-w-24 disabled:opacity-80"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      disabled={isBlocked || isViewing}
                      min={0}
                      value={rawValue ?? 0}
                      onChange={(e) => {
                        setValue(valuePath, Number(e.target.value));
                        setValue(
                          salePricePath,
                          calcFinalPrice(book.salePrice, Number(e.target.value), isPercent)
                        );
                      }}
                      className="max-w-32 min-w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      disabled={isBlocked || isViewing}
                      onValueChange={(val) => {
                        setValue(percentPath, val === 'percent');
                        setValue(
                          salePricePath,
                          calcFinalPrice(book.salePrice, value, val === 'percent')
                        );
                      }}
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
                      className="max-w-32 min-w-24 disabled:opacity-80"
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
